import copy
import random
import math
import os

import torch
from torch_geometric.data import Data

import sys
sys.path.insert(1, 'utils')

from graphutils import create_random_graph

from model import GCN
from game import Game
from mcts import MCTSConfig, mcts

@torch.no_grad
def eval(model: GCN):

    # Create a random graph for evaluation
    random_graph = create_random_graph(num_nodes=5, num_edges=15) # TODO: fix parameters
    
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
    print(f"----- Initialized Game -----\n Edge Index: {game.graph.edge_index.shape}\n Edge Attr: {game.graph.edge_attr.shape}\n x: {game.graph.x.shape}\n Starting Node: {game.start_node}\n")

    records = []
    graphs = []

    config = MCTSConfig(1000, logging=False)
    network = GCN(1, 1)

    i = 0
    total_rewards = 0.0
    while not game.get_is_terminal():
        #print(i, f"visited: {game.visited}")
        pi = mcts(config, game, network)
        action = torch.multinomial(pi, 1).item()
        current_state = copy.deepcopy(game.current_node) # TODO: these deepcopies might be unneccessary
        state, reward, terminal = game.step(torch.tensor([current_state, action]))
        graphs.append(copy.deepcopy(game.graph))
        records.append((current_state, action, pi, reward))
        #print(f"action: {action}")
        total_rewards += reward
        i += 1
        
    z = 0
    # reward_list = torch.tensor([])
    final_records = []
    final_graphs = []
    for G, R in zip(reversed(graphs), reversed(records)):
        s, a, p, r = R
        # reward_list = torch.cat((reward_list, torch.tensor([r])), 0)
        z += r

        # -- old HACK: right now z_prime is calculated from rewards list but I believe it should be from the MCTSNode mu and sigma
        # z_prime = (z - torch.mean(reward_list).item()) / torch.std(reward_list).item() if (not torch.std(reward_list).isnan().item()) and (torch.std(reward_list).item() != 0) else 0
        z_prime = total_rewards # HACK: Now, we use cumulative rewards
        final_records.append((s, a, p, z_prime))
        final_graphs.append(G)

    return final_records, final_graphs

def run_datagen(niter: int):

    # Replace with path to the current best model
    nn = torch.load("model/model_b2.pth")

    for i in range(niter):
        try:
            print(f'# ---- Iteration {i} ---- #')
            dset = {"X": [], "Y": []}

            # HACK: these parameters are pretty arbitrary atm...
            n_nodes = random.randint(10, 100)
            n_edges = random.randint(n_nodes, math.floor((n_nodes - 1)*n_nodes*(1/2))) # ranges from one edge per node to fully connected

            G = create_random_graph(n_nodes, n_edges)
            
            records, graphs = generate_data(nn, G)

            dset["X"] = dset["X"] + graphs
            dset["Y"] = dset["Y"] + records

            # Dump generated data into existing data file
            # - TODO: fix this path logic using __file__
            # - for now, replace with a new file name for the desired dataset location
            if not os.path.exists('model/dset4.pth'):
                torch.save(dset, 'model/dset4.pth')
            else:
                existing_dset = torch.load('model/dset4.pth')
                existing_dset["X"] = existing_dset["X"] + dset['X']
                existing_dset["Y"] = existing_dset["Y"] + dset['Y']
                torch.save(existing_dset, 'model/dset4.pth')
        except:
            continue

if __name__ == '__main__':
    run_datagen(1000)

    # network = GCN(1, 1)
