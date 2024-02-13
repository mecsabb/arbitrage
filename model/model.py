import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv

from game import Game

# "For GCN, we used a 5-layer network with a hidden dimension of size 32." - CombOpt Zero
# Instead, we will proceed with a 3-layer network, same hidden dimension

class GCN(nn.Module):
    def __init__(self, n_features, output_size, hidden_size=32):
        super(GCN, self).__init__()

        self.n_features = n_features
        self.output_size = output_size
        
        # input conv layer, takes input dimension to embedding dimension
        self.conv_in = GCNConv(n_features, hidden_size)

        # hidden conv layer
        self.conv_hidden = GCNConv(hidden_size, hidden_size)
        
        # value vector output layer
        self.value_conv = GCNConv(hidden_size, output_size)

        # policy vector output layer
        self.policy_conv = GCNConv(hidden_size, output_size)

    def illegal_moves_mask(self, game: Game):
        # we set the p and v value of an illegal move to 0
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

        # Apply softmax to policy vector to convert logits to probability
        p = F.softmax(p, dim=1)

        # Apply a mask to 0-out illegal move policy + value
        mask = self.illegal_moves_mask(game)
        p = mask * p.t()
        v = mask * x.t()

        return p, v

class GCNLoss(nn.Module):
    def __init__(self):
        super(GCNLoss, self).__init__()


    def mse(z_prime,v_a):
        """
        Function for (z'-v_a)^2
        :param z_prime: normalized cumulative reward for taking action a from state s (scalar value)
        :param v_a: predicted normalized reward for taking action a from state (scalar value)
        """
        #Pretty sure parameters are NOT vectors, but could be wrong
        return (z_prime - v_a)**2
        #alternative result if they are vectors:
        # z_prime = torch.tensor(z_prime)
        # v_a = torch.tensor(v_a)
        # return torch.mean((z_prime-v_a)**2)

    
    def cross_entropy(p,pi):
        """
        Cross entropy loss function. Compares the 
        :param p: policy vector (what's provided initially by the neural network)
        :param pi: enhanced policy vector (refined policy vector from the MCTS)
        """
        if len(p) != len(pi):
            raise Exception("Length of policy vector (p) does not match length of enhanced policy vector (pi)")
        p = torch.tensor(p)
        pi = torch.tensor(pi)
        #torch only has a built-in binary cross entropy function, 
        #but not cross entropy for multiple probability distributions
        #so, that's what this is supposed to be:
        return torch.mean(-torch.sum(pi * torch.log(p), 1))
        #Source: https://stackoverflow.com/questions/68609414/how-to-calculate-correct-cross-entropy-between-2-tensors-in-pytorch-when-target
        

    def l2_regularization(creg,theta):
        """
        L2 reguralization: meant to prevent overfitting by discouraging larger parameters.
        :param creg: strength/regularization constant - the higher the more sensitive it will be to detect overfitting
        :param theta: list (?) of the model's parameters (i.e. theta0,theta1,...,thetan)
        """
        #Theta is the models "parameters". Not 100% sure what shape it is or how we can access it
        theta = torch.tensor(theta)
        theta = theta ** 2
        return creg*torch.sum((theta))

        
    def forward(self, z_prime,v_a,p,pi,creg,theta):
        return cross_entropy(p,pi) + cross_entropy(p,pi) + l2_regularization(creg,theta)