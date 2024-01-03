import numpy as np

import sys
import os

sys.path.insert(1, os.pardir)

from .model import GCN
from .game import Game

class MCTSNode:
    def __init__(self, parent_edge, node):
        self.edges = []
        self.parent_edge: MCTSEdge = parent_edge
        self.node = node
        
        self.expanded = 0
        self.visits = 0
        
        self.mu = 0
        self.sigma = 0


class MCTSEdge:
    def __init__(self, p: float, parent: MCTSNode, next_: MCTSNode, reward: float):
        # Number of visits
        self.N = 0
        
        # Cumulative action value (sorta like reward)
        self.W = 0
        
        # Average action value
        self.Q = 0
        
        # Probability
        self.P = p
        
        # Parent MCTSNode
        self.parent_node = parent
        
        # Next MCTSNode
        self.next = next_
        
        # Reward (i.e. edge weight)
        self.r = reward

class MCTSConfig:
    def __init__(self, c_iter: int, c_puct=1.5, tau=1):
        self.c_iter = c_iter
        self.c_puct = c_puct
        self.tau = tau

def select_edge(node: MCTSNode, config: MCTSConfig):
    # Calculate UCB score for all child edges, choose edge with highest value
    idx = np.argmax([b.Q + config.c_puct*b.P*(np.sqrt(node.visits - b.N)/(1+b.N)) for b in node.edges])
    edge = node.edges[idx]
    return edge

def backup(path, args):
    # TODO: replace the backup in mcts to be a function, can use the search_path to do this fairly easily
    # - I'm lazy
    pass

def mcts(config: MCTSConfig, game: Game, network: GCN):
    
    root = MCTSNode()
    n_actions = game.get_n_actions()
    
    for _ in range(config.c_iter*n_actions):
        node: MCTSNode = root
        scratch_game: Game = game.clone()
        search_path = [node]
        
        # --- SELECT --- #
        while node.expanded:
            edge = select_edge(node, config)
            node, reward, terminal = scratch_game.step(edge)
            search_path.append(node)
            if terminal:
                break

        # --- EXPAND --- #
        if not game.is_terminal():
            # p and v are vectors with one value for each node in the Game's graph
            # - imagine we added an edge from the current node to each other node, and then made the p and v value for all 
            #   of these new edges 0.  We do this as the network requires a consistent output shape
            p, v = network(game)
            
            # in this loop, we assign a p-value for each edge (i.e. for each POSSIBLE action, NOT the action space)
            # - since p and v are 0 for illegal moves, we guarantee SELECT will not choose them (see formula if confused)
            reward_list = []
            for i, action in enumerate(game.get_total_action_space()):
                
                next_state, reward, terminal = game.simulate_step(action)

                # create a MCTSNode that will represent the new leaf node
                # - awkward looking because MCTSNode and MCTSEdge have a recursive dependence
                state_from_action = MCTSNode(None, next_state)
                
                # initialize the new edge with probabilty, parent (current state), child node, reward
                edge = MCTSEdge(p[i], node, state_from_action, reward)
                
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
        
        # --- BACKUP --- #
        if game.is_terminal():
            # r_estim = 0 if s is a terminal state (from paper)
            r_estim = 0
        else:
            r_estim = node.mu + node.sigma*max(v)
            
        r = r_estim
        while node != root:
            action = node.parent_edge
            node = action.parent_node
            node.visits += 1
            
            r = r + action.r
            r_prime = (r - node.mu)/node.sigma
            action.W += r_prime
            action.N += 1
            action.Q = action.W/action.N
              
    # -- end loop --
    
    policy = [0]*game.get_n_actions()
    for i, a in enumerate(root.edges):
        policy[i] = pow(a.N/(root.visits-a.N), 1/config.tau)
    
    return policy
