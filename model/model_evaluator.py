import torch
from game import Game
import sys
sys.path.insert(1, '/home/armandobean/Qmind/arbitrage/utils')

from model import GCN
from torch_geometric.data import Data
from graphutils import GraphGenerator


def evaluate_model():
    #TODO
    pass

def model_evaluator(model, best_model, num_instances=100):
    model_performance = evaluate_model(model, num_instances) # Need to implement evaluate_model()
    best_model_performance = evaluate_model(best_model, num_instances)

    # Compare the performance of the current model with the best one
    if model_performance > best_model_performance:
        # Store the current model as the new best model
        best_model = model
        print("New best model found!")

    # You can also log or print the performance metrics for analysis
    print(f"Current Model Performance: {model_performance}")
    print(f"Best Model Performance: {best_model_performance}")

    return best_model

def evaluate_model_on_random_graph(model: GCN):
    try:
        # Create a random graph for evaluation
        graph_generator = GraphGenerator(min_weight=1, max_weight=10, max_nodes=26)
        random_graph = graph_generator.generate_fully_connected_graph(num_nodes=5)

        print("Random Graph:")
        print(random_graph.data)

        # Convert graph data to PyTorch tensors
        x = torch.tensor(random_graph.x, dtype=torch.float)
        edge_index = torch.tensor(random_graph.edge_index, dtype=torch.long)
        edge_weight = torch.tensor(random_graph.edge_attr, dtype=torch.float) if hasattr(random_graph, 'edge_attr') else None

        # Create a Game instance with the random graph
        game = Game(graph=Data(x=x, edge_index=edge_index, edge_attr=edge_weight))

        # Evaluate the model on the random graph
        p, v = model(game, edge_weight)

        print("Policy (p) Output:")
        print(p)

        print("Value (v) Output:")
        print(v)

    except Exception as e:
        print(f"An error occurred during evaluation: {e}")


def graph_evaluation_logic():
    # Not sure how to implement the logic evaluation using the model random graph instance yet
    pass
    
def simulate_evaluation(model, graph_instance):
    instance_performance = graph_evaluation_logic(model, graph_instance)
    return instance_performance


input_size, output_size = 2, 8 
model = GCN(input_size, output_size)
print(evaluate_model_on_random_graph(model))