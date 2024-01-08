from flask import Flask, request, jsonify

app = Flask(__name__)

def shortest_path(graph):
    pass

def get_model_score():
    pass
@app.route('/process-graph', methods=['POST'])
def process_data():
    #get json graph from request
    graph = request.json

    #return path as json
    return jsonify(shortest_path(graph))

@app.route('/evaluate-model')
def score_model():
    return jsonify(get_model_score())


if __name__ == '__main__':
    app.run(debug=True)