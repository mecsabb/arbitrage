from flask import Flask, request, jsonify

app = Flask(__name__)

def shortest_path(graph):
    return graph

def get_model_score(graph):
    return graph

@app.route('/process-graph', methods=['POST'])
def process_data():
    #get json graph from request
    graph = request.json

    #find shortest path using model
    path = shortest_path(graph) 

    #return path as json
    return jsonify(path)

@app.route('/evaluate-model')
def score_model():
    return get_model_score()


if __name__ == '__main__':
    app.run(debug=True)