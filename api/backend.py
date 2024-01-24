from flask import Flask, request, jsonify
from flask_cors import CORS # added cors to deal with issues from the frontend and backend being served from separate domains 

app = Flask(__name__)
CORS(app)

def shortest_path(graph):
    return graph

def get_model_score(graph):
    return graph

@app.route('/process-graph', methods=['POST'])
def process_data():
    # get json graph from request
    graph = request.json

    # print the received JSON in the console
    print('Received JSON:', graph)

    # return path as json
    return jsonify(shortest_path(graph))

@app.route('/evaluate-model')
def score_model():
    return jsonify(get_model_score())

if __name__ == '__main__':
    app.run(debug=True)