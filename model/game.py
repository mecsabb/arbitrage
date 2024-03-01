import copy
import random

import numpy as np
import torch
from torch_geometric.data import Data
import networkx as nx
#import matplotlib.pyplot as plt

class Game:
    """ Game object (named as conventionally MCTS interacts with games) wraps and manages our rl environment """
    def __init__(self, graph: Data, state: int=-1):
        self.graph: Data = graph

        if state == -1:
            # HACK: for now, let's start the state as a (uniform) random node
            # - In reality, this is a (potentially very) bad idea
            initial_state = np.random.randint(0, len(graph.x) - 1)
        else:
            initial_state = state

        # the node initial state of the environment
        self.start_node = initial_state
        self.current_node = initial_state

        # set the initial_state to be visited
        self.graph.x[initial_state] = 1
        self.visited = set([initial_state])
        self.is_terminal = False

    def get_state(self):
        # Return the current node
        return self.current_node

    def get_action_space(self):
        # Return all outward edges from the current node as action space
        edges_from_current = self.graph.edge_index[0] == self.current_node
        return self.graph.edge_index[:, edges_from_current]
    
    def get_total_action_space(self):
        # Returns all possible nodes
        # WARNING: this is (n, 2) while our edge_index is (2, n)
        return torch.tensor([[self.current_node, a] for a in range(self.graph.x.shape[0])]) 

    def step(self, action: torch.Tensor):
        # Move along the edge if it's a valid action
        exists = (self.graph.edge_index.t() == action).all(dim=1).any().item()
        if exists:
            self.current_node = action[1].item()
            
            # Update visited nodes and check for terminal state
            if self.current_node in self.visited: # and self.current_node == self.start_node:
                self.is_terminal = True

            # Update visited to include this state, update x to reflect this state change
            self.graph.x[self.current_node] = 1.
            self.visited.add(self.current_node)

            # Reward is the weight of the edge
            edge_idx = (self.graph.edge_index.t() == action).all(dim=1)

            # print(f"Action: {action}")
            # print(f"Edge Index: {edge_idx}")
            # print(f"Edge Attr: {self.graph.edge_attr}")

            reward = self.graph.edge_attr[edge_idx].item()
            return self.get_state(), reward, self.is_terminal
        else:
            raise ValueError(f''' 
                             --- Invalid action: selected action {action} which was not found in action space {self.get_action_space().t()} ---
                             ''')

    def simulate_step(self, action):
        # The same as step, but without updating actual game state
        terminal = False
        next_state = action[1].item()

        # Update visited nodes and check for terminal state
        if next_state in self.visited and next_state == self.start_node:
            terminal = True

        # Reward is the weight of the edge
        edge_idx: torch.Tensor = (self.graph.edge_index.t() == action).all(dim=1)
        if edge_idx.any():
            reward = self.graph.edge_attr[edge_idx].item()
        else:
            reward = 0 # HACK: used to be -inf but that causes errors...
        return next_state, reward, terminal
    
    def get_is_terminal(self):
        # Check if the environment is in a terminal state
        return self.is_terminal

    def get_reward(self, edge: torch.Tensor):
        # Find the index of the edge in the edge_index tensor
        edge_idx: torch.Tensor = (self.graph.edge_index.t() == edge).all(dim=1).nonzero(as_tuple=True)[0]
        if edge_idx.nelement() == 0:
            raise ValueError("Edge not found in graph")

        # Return the weight of the edge
        return self.graph.edge_attr[edge_idx].item()

    def render(self):
        # Convert PyG graph to NetworkX for visualization
        G = nx.DiGraph()
        for source, target in self.graph.edge_index.t().tolist():
            weight = self.graph.edge_attr[(self.graph.edge_index.t() == torch.tensor([source, target])).all(dim=1)].item()
            G.add_edge(source, target, weight=weight)

        pos = nx.spring_layout(G)  # Positioning of nodes
        nx.draw(G, pos, with_labels=True, node_color='skyblue', node_size=700)
        nx.draw_networkx_edge_labels(G, pos, edge_labels=nx.get_edge_attributes(G, 'weight'))
        plt.title('Current State of the Graph')
        plt.show()
    
    def get_n_actions(self):
        return len(self.get_action_space())

    def clone(self):
        return copy.deepcopy(self)
    