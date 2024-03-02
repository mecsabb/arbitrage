from flask import Flask, request, jsonify
from flask_cors import CORS # added cors to deal with issues from the frontend and backend being served from separate domains
import torch
from torch_geometric.data import Data
from torch_geometric.utils import to_undirected
import json
import copy
import sys
import math
import random

sys.path.append("../model")

from game import Game
from model import GCN

model = torch.load('model_b3.pth')

app = Flask(__name__)
CORS(app, origins=['*']) # Change this before deployment!

def arbitrage_path(edge_index, edge_attr, x, ea):
    
    G = Data(x, edge_index, edge_attr)
    print(edge_index.t())
    game = Game(G)
    print(game.graph.edge_index.t())
    path = [copy.deepcopy(game.current_node)]
    try:
        while not game.is_terminal:
            policy, value = model(game)
            model_decision = torch.multinomial(policy, 1)
            a = torch.cat((torch.tensor([game.current_node]), model_decision), 0)
            print(a)
            _, model_reward, _ = game.step(a)

            path.append(model_decision.item())
    except Exception as e:
        print(policy)
        print(e)
        return False

    for i, node in enumerate(path):
        path[i] = node + 1
    
    if len(path) == 2:
        path = arbitrage_path(edge_index, edge_attr, x, ea)
    if path[-1] == path[-3]:
        path = arbitrage_path(edge_index, edge_attr, x, ea)
    
    path = path[path.index(path[-1]):]
    
    # # check path len
    # actions = [torch.tensor(a) for a in zip(path, path[1:])]
    # print(actions)
    # edge_list = [tuple(edge) for edge in edge_index.t().tolist()]
    # weights = []
    # for edge in torch.stack(actions).tolist():
    #     print('edge:', edge)
    #     if tuple(edge) in edge_list:
    #         print('yes')
    #         edge_idx = edge_list.index(tuple(edge))
    #         weights.append(edge_attr[edge_idx])
    # weight_tensor = torch.stack(weights)
    # arb = weight_tensor.prod().item()
    # if arb < 1:
    #     path = arbitrage_path(edge_index, edge_attr, x, ea)

    return path
    # return ['XBT', 'MATIC', 'USDT', 'LTC', 'ETH', 'KAVA']
    # return [1, 3, 5]

def get_model_score(graph):
    return graph

@app.route('/', methods=['GET'])
def index():
    return "Welcome to the backend"

@app.route('/process-graph', methods=['GET', 'POST'])
def process_data():
    if request.method == 'POST':
        # get json graph from request
        graph_data = request.json
        tensor_arr = [[], []]
        edge_weights = []
        ea = []
        x_arr = []

        for link in graph_data[0]:
            # print(link)
            tensor_arr[0].append(int(link['source']['id'])-1)
            tensor_arr[1].append(int(link['target']['id'])-1)
            # edge_weights.append(math.log(float(link['weight'])+0.001))
            edge_weights.append(random.uniform(-1, 1)) # Demo test edges
            ea.append([float(link['weight'])])

        for link in graph_data[0]:
            # print(link)
            tensor_arr[0].append(int(link['target']['id'])-1)
            tensor_arr[1].append(int(link['source']['id'])-1)
            # edge_weights.append(math.log(1/(float(link['weight'])+0.1)+0.1))
            edge_weights.append(random.uniform(-1, 1)) # Demo test edges
            ea.append([1 / (float(link['weight']) + 0.0001)])

        x_arr = [[0]]*int(len(graph_data[1])) # Creates an array of [0]s the length of the total number of nodes

        # Formatting for the model
        edge_index = torch.tensor(tensor_arr, dtype=torch.long)
        edge_attr = torch.tensor(edge_weights, dtype=torch.float).view(-1, 1)
        print(edge_index)
        x = torch.tensor(x_arr, dtype=torch.float)
        
        #Run through model, get output
        path = arbitrage_path(edge_index, edge_attr, x, torch.tensor(ea))

        return jsonify(path)
        # return path as json
    else:
        return "method is get"

@app.route('/evaluate-model')
def score_model():
    return jsonify(get_model_score())

if __name__ == '__main__':
    app.run(debug=True)