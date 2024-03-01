from flask import Flask, request, jsonify
from flask_cors import CORS # added cors to deal with issues from the frontend and backend being served from separate domains
import torch
from torch_geometric.data import Data
import json
import copy
import sys

sys.path.append("../model")

from game import Game

model = torch.load('model_b2.pth')

app = Flask(__name__)
CORS(app, origins=['*']) # Change this before deployment!

def arbitrage_path(edge_index, edge_attr, x):
    
    # G = Data(x, edge_index, edge_attr)
    # game = Game(G)
    # path = [copy.deepcopy(game.current_node)]

    # while not game.is_terminal:
    #     policy, value = model(game)
    #     model_decision = torch.multinomial(policy, 1)
    #     a = torch.cat((torch.tensor([game.current_node]), model_decision), 0)
    #     _, model_reward, _ = game.step(a)

    #     path.append(model_decision)

    # for node in path:
    #     node += 1
    
    # return path
    # return ['XBT', 'MATIC', 'USDT', 'LTC', 'ETH', 'KAVA']
    return [1, 3, 5]

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
        x_arr = []

        for link in graph_data[0]:
            # print(link)
            tensor_arr[0].append(int(link['source']['index']))
            tensor_arr[1].append(int(link['target']['index']))
            edge_weights.append(float(link['weight']))

        x_arr = [[0]]*int(len(graph_data[1])) # Creates an array of [0]s the length of the total number of nodes

        # Formatting for the model
        edge_index = torch.tensor(tensor_arr, dtype=torch.long)
        edge_attr = torch.tensor(edge_weights, dtype=torch.float).view(-1, 1)
        x = torch.tensor(x_arr, dtype=torch.float)
        
        #Run through model, get output
        path = arbitrage_path(edge_index, edge_attr, x)

        return jsonify(path)
        # return path as json
    else:
        return "method is get"

@app.route('/evaluate-model')
def score_model():
    return jsonify(get_model_score())

if __name__ == '__main__':
    app.run(debug=True)