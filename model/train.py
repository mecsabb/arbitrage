import torch
from torch_geometric.data import Data

import sys
sys.path.insert(1, 'utils')

from graphutils import create_random_graph

from model import GCN
from game import Game
from mcts import mcts


@torch.no_grad
def eval(model: GCN):

    # Create a random graph for evaluation
    random_graph = create_random_graph(num_nodes=5, num_edges=15)
    
    # Commenting out print because it doesn't work for me...
    # print_graph(random_graph)

    game = Game(graph=random_graph)
    print(f"----- Initialized Game -----\n Edge Index: {game.graph.edge_index.t()}\n Edge Attr: {game.graph.edge_attr}\n x: {game.graph.x}\n Starting Node: {game.start_node}\n")

    total_reward = 0.0
    is_terminal = False
    ix = 0
    while not is_terminal:        
        # Get the model's policy and value predictions
        policy, value = model(game)
        # Choose the node with the highest probability, create a tensor with the current node
        # - this changes the node selection into an action selection that can be processed by our game state 
        node_selection = torch.multinomial(policy, 1).item()
        action_edge = torch.tensor([game.current_node, node_selection])

        # Save previous action space for logging
        prev_action_space = game.get_action_space()
        prev_x = game.graph.x.clone()

        # Perform the action and get the reward
        state, reward, is_terminal = game.step(action_edge)

        # Accumulate the reward
        total_reward += reward
        
        # Uncomment to supress large output
        # if ix % 10000 == 0:
        print(f"Index {ix}...\n Action Space: {prev_action_space.t()}\n Policy: {policy}\n Selection: {node_selection}\n Reward: {reward}\n x: {prev_x}")

        ix += 1

    print(f"Total Reward: {total_reward}")

def generate_data(network: GCN, graph: Data):
    """
    Self-play Data Generation
    Require: Network f_θ, Initial graph G_0
    Ensure: Return self-play data records
        {self-play}
        s = Init(G_0)
        records = {}
        while s !∈ S_end do
            π = MCTS(s)
            a = sampled action according to probability π
            s ← T(s, a)
            Add (s, a, π) to records
        end while
        {calculate z'}
        z = 0
        for all (s, a, π) in records (reversed order) do
            z ← z + R(s, a)
            z' = (z - µR(s))/sigma*R(s)
            Replace (s, a, π) with (s, a, π, z')
        end for
        return records
    """

    game = Game(graph)
    records = {}

    pass

if __name__ == '__main__':
    n_features, output_size = 1, 1
    model = GCN(n_features, output_size)
    eval(model)
