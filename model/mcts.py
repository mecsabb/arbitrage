import matplotlib.pyplot as plt
import numpy as np
import networkx as nx
import torch
import torch.nn.functional as F

from copy import deepcopy
import logging
from typing import List
import sys
import os

sys.path.insert(1, 'utils')

from model import GCN
from game import Game

from graphutils import create_random_graph

class MCTSNode:
    """Monte Carlo Tree Search Tree Node"""
    def __init__(self, parent_edge, node, edges=None):
        if edges is None:
            self.edges: List[MCTSEdge] = []
        else:
            self.edges: List[MCTSEdge] = edges

        self.parent_edge: MCTSEdge = parent_edge
        self.node = node
        
        self.expanded = 0
        self.visits = 0
        
        self.mu: float = 0.0
        self.sigma: float = 0.0

class MCTSEdge:
    """Monte Carlo Tree Search Tree Edge"""
    def __init__(self, p: float, parent: MCTSNode, next_: MCTSNode, reward: float):
        # Number of visits
        self.N: int = 0
        
        # Cumulative action value (sorta like reward)
        self.W = 0.0
        
        # Average action value
        self.Q = 0.0
        
        # Probability
        self.P: float = p
        
        # Parent MCTSNode
        self.parent_node: MCTSNode = parent
        
        # Next MCTSNode
        self.next: MCTSNode = next_
        
        # Reward (i.e. edge weight)
        self.r: float = reward

class MCTSConfig:
    def __init__(self, c_iter: int, logging=True, c_puct=1.5, tau=1):
        self.c_iter = c_iter
        self.c_puct = c_puct
        self.tau = tau
        self.logging = logging

class MCTSLogger:
    def __init__(self, name='mcts-logger', log_level=logging.DEBUG):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(log_level)

        formatter = logging.Formatter('%(message)s')

        ch = logging.StreamHandler()
        ch.setLevel(log_level)
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)

    def select(self):
        self.logger.debug("\n# --- SELECT --- #\n")

    def expand(self):
        self.logger.debug("\n# --- EXPAND --- #\n")

    def backup(self):
        self.logger.debug("\n# --- BACKUP --- #\n")

    def log_select(self, node: MCTSNode, edge: MCTSEdge):

        for i, e in enumerate(node.edges):
            self.logger.debug(f"Edge {i}:\n N: {e.N}\n W: {e.W}\n Q: {e.Q}\n P: {e.P}")

        self.logger.debug(f"SELECTED EDGE {edge}")

    def log_expand(self, node: MCTSNode):
        for i, e in enumerate(node.edges):
            self.logger.debug(f"Edge {i}:\n N: {e.N}\n W: {e.W}\n Q: {e.Q}\n P: {e.P}")

    def log_backup(self, params):
        pass

    # A bit of a hack, but it works...
    def disable_logging(self):
        self.logger.setLevel(logging.CRITICAL)

    def enable_logging(self):
        self.logger.setLevel(logging.DEBUG)

# Global logging object
mcts_logger = MCTSLogger()

def select_edge(node: MCTSNode, config: MCTSConfig, game: Game):
    # Calculate UCB score for all child edges, choose edge with highest value
    ucb = torch.tensor([b.Q + config.c_puct*b.P*(np.sqrt(node.visits - b.N)/(1+b.N)) for b in node.edges])

    # Force illegal moves to -inf
    mask = torch.zeros(game.graph.x.shape[0])
    edges_from_current = game.graph.edge_index[0] == game.current_node
    directly_connected_nodes = game.graph.edge_index[1, edges_from_current]
    mask[directly_connected_nodes] = 1

    ucb[mask == 0] = float('-inf')

    idx = torch.argmax(ucb).item()
    edge = node.edges[idx]

    mcts_logger.logger.debug(f"UCB: {ucb}")
    mcts_logger.log_select(node, idx)

    return edge

def backup(path, args):
    # TODO: replace the backup in mcts to be a function, can use the search_path to do this fairly easily
    # - I'm lazy
    pass

@torch.no_grad
def mcts(config: MCTSConfig, game: Game, network: GCN):
    
    if not config.logging:
        mcts_logger.disable_logging()
    else: 
        mcts_logger.enable_logging()

    root = MCTSNode(None, game.get_state()) # HACK: Only keep this while game state is randomly initialized
    n_actions = game.get_n_actions()
    
    for _ in range(config.c_iter*n_actions):
        node: MCTSNode = root
        scratch_game: Game = game.clone()
        search_path: List[MCTSNode] = [node]
        
        # --- SELECT --- #
        mcts_logger.select()

        while node.expanded:
            edge = select_edge(node, config, scratch_game)

            # Update current node
            prev_node: MCTSNode = deepcopy(node.node)
            node: MCTSNode = edge.next
            search_path.append(node)

            # We create a tensor (representing a PyG graph edge) and use it to update our scratch_game
            next_state, reward, terminal = scratch_game.step(torch.tensor([prev_node, node.node]))

            if scratch_game.is_terminal:
                break

        # --- EXPAND --- #
        mcts_logger.expand()

        if not scratch_game.is_terminal:
            # p and v are the vector outputs of our GCN model's forward pass
            # - they are the same shape as game.graph.x i.e. (# of nodes, 1)
            # - imagine we "added" an edge from the current node to each other node, and then assigned a p and v value of 0 for all 
            #   of these new edges (that do not exist in the real graph).  We do this as the network requires a consistent output shape
            p, v = network(scratch_game)

            # in this loop, we assign the corresponding p-value (from our network p output) for each edge (i.e. for each POSSIBLE action, NOT the action space)
            # - since UCB forces illegal moves to -inf, we guarantee SELECT will not choose them regardless of their value
            reward_list = []
            for i, action in enumerate(scratch_game.get_total_action_space()):
                
                next_state, reward, terminal = scratch_game.simulate_step(action)

                # create a MCTSNode that will represent the new leaf node
                # - awkward looking because MCTSNode and MCTSEdge have a recursive dependence
                state_from_action = MCTSNode(None, next_state)
                
                # initialize the new edge with probabilty, parent (current state), child node, reward
                edge = MCTSEdge(p.view(-1)[i].item(), node, state_from_action, reward)
                
                # set the new edge as the parent of the new leaf node
                state_from_action.parent_edge = edge
                node.edges.append(edge)
                reward_list.append(reward)
                
            # calculate mu, sigma
            # - mean and std of W(s,a)? thats what I'm going with...
            # - TODO: verify if random sampling is better than fully calculating
            node.mu = np.mean(reward_list)
            node.sigma = np.std(reward_list)
            node.expanded = True

            # Log previous node and expanded edges
            mcts_logger.log_expand(node)
        
        # --- BACKUP --- #
        mcts_logger.backup()
        if scratch_game.is_terminal:
            # r_estim = 0 if s is a terminal state (from paper)
            r_estim = 0
        else:
            r_estim = node.mu + node.sigma*max(v)
            
        r = r_estim
        while node != root: # BUG: this is currently not updating correctly
            action = node.parent_edge
            node = action.parent_node
            node.visits += 1
            
            r = r + action.r
            r_prime = (r - node.mu)/node.sigma
            action.W += r_prime
            action.N += 1
            action.Q = action.W/action.N
              
    # -- end loop --
    
    policy: List[float] = [0.]*len(root.edges) # HACK: should be n_actions, not sure why I'm getting an error
    for i, a in enumerate(root.edges):
        policy[i] = pow(a.N/(root.visits-a.N), 1/config.tau) if (root.visits-a.N) else 1. # HACK: what should this else be?
    
    # -- uncomment for debug --
    # visualize_mcts(root)
    
    # 0 out illegal moves
    p = torch.tensor(policy)
    mask = torch.zeros(game.graph.x.shape[0])
    edges_from_current = game.graph.edge_index[0] == game.current_node
    directly_connected_nodes = game.graph.edge_index[1, edges_from_current]
    mask[directly_connected_nodes] = 1
    p: torch.Tensor = mask * p.t()
    p[p == 0] = float('-inf')

    return F.softmax(p, dim=0)

def visualize_mcts(root_node: MCTSNode):
    G = nx.DiGraph()
    
    def add_nodes_edges(node: MCTSNode, depth=0):  # Add depth parameter
        node_id = id(node)
        # Include node.node in the attributes for G.add_node
        G.add_node(node_id, visits=node.visits, mu=node.mu, depth=depth, label=node.node)  # Add label attribute
        if node.parent_edge is not None:
            parent_id = id(node.parent_edge.parent_node)
            G.add_edge(parent_id, node_id, weight=node.parent_edge.P)
        for edge in node.edges:
            next_node = edge.next
            next_node_id = id(next_node)
            # No need to add the node again if it's already been added, just update or ensure its existence
            if next_node_id not in G:
                G.add_node(next_node_id, visits=next_node.visits, mu=next_node.mu, label=next_node.node)  # Also add label here
            G.add_edge(node_id, next_node_id, weight=edge.P)
            add_nodes_edges(next_node, depth + 1)  # Increment depth for child nodes
    
    # Start the recursive process
    add_nodes_edges(root_node)
    
    # Custom layout: Assign positions based on the depth and the order of nodes at each depth
    pos = {}
    if G.nodes:  # Check if the graph is not empty
        levels = sorted(set(nx.get_node_attributes(G, 'depth').values()))
        if levels:  # Ensure there are levels to work with
            width = max(len([node for node in G.nodes if G.nodes[node].get('depth', -1) == level]) for level in levels)
            for level in levels:
                nodes_at_level = [node for node in G.nodes if G.nodes[node].get('depth', -1) == level]
                level_width = len(nodes_at_level)
                for i, node in enumerate(nodes_at_level):
                    pos[node] = np.array([i - level_width / 2, -level])
            # Modify this line to use the 'label' attribute for labels
            labels = {node: G.nodes[node]['label'] for node in G.nodes()}
            nx.draw(G, pos, labels=labels, with_labels=True, node_size=700, node_color="lightblue", arrows=True)
            plt.show()
        else:
            print("No levels found in the graph.")
    else:
        print("Graph is empty.")

def test_expand():
    pass

def test_select():
    pass

def test_backup():
    pass

if __name__ == '__main__':
    config = MCTSConfig(3)
    graph = create_random_graph(5, 15)
    game = Game(graph)
    network = GCN(1, 1)

    print(f"----- Initialized Game -----\n Edge Index: {game.graph.edge_index.t()}\n Edge Attr: {game.graph.edge_attr}\n x: {game.graph.x}\n Starting Node: {game.start_node}\n")
    print(mcts(config, game, network))
