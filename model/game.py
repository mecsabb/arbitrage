import copy
import random
import numpy as np
import torch
from torch_geometric.data import Data
import networkx as nx
import matplotlib.pyplot as plt

class Game:
    # Game object (named as conventionally MCTS interacts with games) wraps and manages our rl environment

    def __init__(self, graph: Data, args=None):
        self.graph = graph
        self.args = args
        self.current_node = None
        self.start_node = None
        self.visited = set()
        self.is_terminal = False

    def get_state(self):
        # Return the current node
        return self.current_node

    def get_action_space(self):
        # Return all outward edges from the current node as action space
        edges_from_current = self.graph.edge_index[0] == self.current_node
        return self.graph.edge_index[:, edges_from_current]
    
    def get_total_action_space(self):
        return torch.tensor([a for a in range(self.graph.x.shape[0])])

    def step(self, action):
        # Move along the edge if it's a valid action
        if action in self.get_action_space().t():
            self.current_node = action[1].item()

            # Update visited nodes and check for terminal state
            if self.current_node in self.visited and self.current_node == self.start_node:
                self.is_terminal = True
            self.visited.add(self.current_node)

            # Reward is the weight of the edge
            edge_idx = (self.graph.edge_index.t() == action).all(dim=1)
            reward = self.graph.edge_attr[edge_idx].item() if self.graph.edge_attr is not None else 0
            return self.get_state(), reward, self.is_terminal
        else:
            raise ValueError("Invalid action")

    def simulate_step(self, action):
        # The same as step, but without updating actual game state
        if action in self.get_action_space().t():
            next_state = action[1].item()

            # Update visited nodes and check for terminal state
            if next_state in self.visited and next_state == self.start_node:
                terminal = True

            # Reward is the weight of the edge
            edge_idx = (self.graph.edge_index.t() == action).all(dim=1)
            reward = self.graph.edge_attr[edge_idx].item() if self.graph.edge_attr is not None else 0
            return next_state, reward, terminal
        else:
            raise ValueError("Invalid action")
        
    def is_terminal(self):
        # Check if the environment is in a terminal state
        return self.is_terminal

    def get_reward(self, edge):
        # Find the index of the edge in the edge_index tensor
        edge_idx = (self.graph.edge_index.t() == torch.tensor(edge)).all(dim=1).nonzero(as_tuple=True)[0]
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
    
    def sample_action(self, num_simulations=100, max_steps_per_simulation=10):
        #TODO: verify this function
        
        original_state = self.clone()  # Save the original state
        cumulative_rewards = []

        for _ in range(num_simulations):
            self.reset_to(original_state)  # Reset to the original state
            cumulative_reward = 0
            steps = 0

            while not self.is_done() and steps < max_steps_per_simulation:
                # Sample a random action
                action_space = self.get_action_space()
                action = random.choice(action_space.t().tolist())
                
                # Perform the action and accumulate reward
                _, reward, _ = self.step(action)
                cumulative_reward += reward
                steps += 1

            cumulative_rewards.append(cumulative_reward)

        # Restore the original state
        self.__dict__.update(original_state.__dict__)

        # Calculate mean and standard deviation
        mean_reward = np.mean(cumulative_rewards)
        std_reward = np.std(cumulative_rewards)

        return mean_reward, std_reward
