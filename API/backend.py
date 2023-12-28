from flask import Flask, request, jsonify

app = Flask(__name__)

def shortest_path(graph):
    return graph

@app.route('/process-data', methods=['POST'])
def process_data():
    #get json graph from request
    graph = request.json

    #find shortest path using model
    path = shortest_path(graph) 

    #return path as json
    return jsonify(modified_data)

if __name__ == '__main__':
    app.run(debug=True)