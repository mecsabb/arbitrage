import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GraphConv

from game import Game

# "For GCN, we used a 5-layer network with a hidden dimension of size 32." - CombOpt Zero
# Instead, we will proceed with a 3-layer network, same hidden dimension

class GCN(nn.Module):
    def __init__(self, n_features, output_size, hidden_size=32):
        super(GCN, self).__init__()

        self.n_features = n_features
        self.output_size = output_size
        
        # input conv layer, takes input dimension to embedding dimension
        self.conv_in = GraphConv(n_features, hidden_size)

        # hidden conv layer
        self.conv_hidden = GraphConv(hidden_size, hidden_size)
        
        # value vector output layer
        self.value_conv = GraphConv(hidden_size, output_size)

        # policy vector output layer
        self.policy_conv = GraphConv(hidden_size, output_size)

    def illegal_moves_mask(self, game: Game):
        # we set the p and v value of an illegal move to -inf
        # - this guarantees the move will not be chosen by SELECT, so we can safely add it as an MCTS Node

        mask = torch.zeros(game.graph.x.shape[0])
        
        # Find the indices of edges that emanate from the current node
        edges_from_current = game.graph.edge_index[0] == game.current_node
        
        # Find the target nodes of those edges
        directly_connected_nodes = game.graph.edge_index[1, edges_from_current]
        
        # Set the mask to 1 for directly connected nodes
        mask[directly_connected_nodes] = 1

        return mask

    def forward(self, game: Game):
        x, edge_index, edge_attr = game.graph.x, game.graph.edge_index, game.graph.edge_attr

        # Layer 1, input
        x = self.conv_in(x, edge_index, edge_attr)
        x = F.relu(x)
        
        # Layer 2, hidden
        x = self.conv_hidden(x, edge_index, edge_attr)
        x = F.relu(x)

        # Layer 3, out
        p = self.policy_conv(x, edge_index, edge_attr)
        v = self.value_conv(x, edge_index, edge_attr)

        # Apply a mask to 0-out illegal move policy + value
        mask = self.illegal_moves_mask(game)
        p: torch.Tensor = mask * p.t()
        v: torch.Tensor = mask * v.t()

        # Set zero'd policy to -inf to force softmax to 0
        p[p == 0] = float('-inf')

        # Apply softmax to policy vector to convert logits to probability
        p = F.softmax(p, dim=1)

        return p.view(-1), v.view(-1) # HACK: is cloning here correct?

class GCNLoss(nn.Module):
    def __init__(self):
        super(GCNLoss, self).__init__()

    def mse(self, z_prime, v_a):
        """
        Function for (z'-v_a)^2
        :param z_prime: normalized cumulative reward for taking action a from state s (scalar value)
        :param v_a: predicted normalized reward for taking action a from state (scalar value)
        """
        return (z_prime - v_a)**2
    
    def cross_entropy(self, p: torch.Tensor, pi: torch.Tensor):
        """
        Cross entropy loss function. Compares the 
        :param p: policy vector (what's provided initially by the neural network)
        :param pi: enhanced policy vector (refined policy vector from the MCTS)
        """
        if len(p) != len(pi):
            raise Exception("Length of policy vector (p) does not match length of enhanced policy vector (pi)")
        return torch.mean(-torch.sum(pi * torch.log(p), 1))
        
    def forward(self, z_prime, v_a, p, pi):
        return self.mse(z_prime, v_a) + self.cross_entropy(p, pi)
    