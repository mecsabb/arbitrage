from flask import Flask, request, jsonify
from flask_cors import CORS # added cors to deal with issues from the frontend and backend being served from separate domains
import torch
from torch_geometric.data import Data
import json

app = Flask(__name__)
CORS(app, origins=['*']) # Change this before deployment!

def arbitrage_path(edge_index, edge_attr, x):
    return ['XBT', 'MATIC', 'USDT', 'ETH']

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
        # print(graph_data[0][0]['source']['index'])
        for link in graph_data[0]:
            # print(link)
            tensor_arr[0].append(int(link['source']['index'])-1)
            tensor_arr[1].append(int(link['target']['index'])-1)
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