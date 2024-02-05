import torch
from game import Game
import sys
sys.path.insert(1, 'utils')
from model import GCN
from graphutils import *


def evaluate_model_on_random_graph(model: GCN):
    try:
        # Create a random graph for evaluation
        graph_generator = GraphGenerator(min_weight=1, max_weight=10, max_nodes=26)
        random_graph = graph_generator.generate_fully_connected_graph(num_nodes=5)

        game = Game(graph=random_graph.data)
    
        # Create a Game instance with the random graph
        for edge in range(random_graph.data.edge_index.shape[1]):
            u, v = random_graph.data.edge_index[:, edge].tolist()
            weight = random_graph.data.edge_attr[edge].item() if hasattr(random_graph.data, 'edge_attr') else 1
            game.add_edge(u, v, weight)
            
        total_reward = 0.0
        edge_weight = None  # Start from an arbitrary edge (or None) to initiate the loop

        is_terminal = False
        while not is_terminal:
            # Get the model's policy and value predictions
            policy, value = model(game, edge_weight)

            # Choose the action (edge) with the highest probability
            action_edge = torch.argmax(policy).item()

            # Perform the action and get the reward
            state, reward, is_terminal = game.step(action_edge)

            # Accumulate the reward
            total_reward += reward

            # Update the current edge for the next iteration
            current_edge = action_edge

        print(f"Total Reward: {total_reward}")

    except Exception as e:
        print(f"An error occurred during evaluation: {e}")



input_size, output_size = 2, 6
model = GCN(input_size, output_size)
print(evaluate_model_on_random_graph(model))