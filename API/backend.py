from flask import Flask, request, jsonify

#---
app = Flask(__name__)

def shortest_path(graph):
    "returns a list of nodes and edges of the shortest path"

def get_model_score():
    "returns the score of the model"

@app.route('/process-graph', methods=['POST'])
def process_data():
    #get json graph from request
    graph = request.json

    #return path as json
    return jsonify(shortest_path(graph))

@app.route('/evaluate-model')
def score_model():
    #return path as json
    return jsonify(get_model_score())

if __name__ == '__main__':
    app.run(debug=True)