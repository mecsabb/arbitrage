import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv

from .game import Game

# "For GCN, we used a 5-layer network with a hidden dimension of size 32."
# need to make the model apply a 0 probability to illegal moves

class GCN(nn.Module):
    def __init__(self, input_size, output_size, hidden_size=32):
        super(GCN, self).__init__()

        self.input_size = input_size
        self.output_size = output_size
        
        self.conv1 = GCNConv(input_size, 32)
        self.conv2 = GCNConv(32, 32)
        self.conv3 = GCNConv(32, 32)
        self.conv4 = GCNConv(32, 32)
        self.conv5 = GCNConv(32, 32)

        self.v_lin = nn.Linear(32, output_size)
        self.p_lin = nn.Linear(32, output_size)

    def illegal_moves_mask(self, game: Game):
        # we set the p and v value of an illegal move to 0
        # - this guarantees the move will not be chosen by SELECT, so we can safely add it as an MCTS Node

        mask = torch.zeros((self.output_size, 1))
        
        # Find the indices of edges that emanate from the current node
        edges_from_current = game.graph.edge_index[0] == game.current_node
        
        # Find the target nodes of those edges
        directly_connected_nodes = game.graph.edge_index[1, edges_from_current]
        
        # Set the mask to 1 for directly connected nodes
        mask[directly_connected_nodes] = 1
        return mask

    def forward(self, game: Game, edge_weight=None):
        x, edge_index = game.graph.x, game.graph.edge_index
        # make x follow 5 conv layers
        for i, conv in enumerate([self.conv1, self.conv2, self.conv3, self.conv4, self.conv5]):
            x = conv(x, edge_index, edge_weight) if i == 0 else conv(x, edge_index)
            x = F.relu(x)
            #x = F.dropout(x, training=self.training)

        # make the network output a p and v
        # - need one fc layer for each
        p = F.softmax(self.p_lin(x), dim=1)
        v = self.v_lin(x)
        
        mask = self.illegal_moves_mask(game)

        p*= mask
        v*= mask

        return p, v

class GCNLoss(nn.Module):
    def __init__(self):
        super(GCNLoss, self).__init__()
    
    def forward(self, params):
        # TODO: create loss function from paper @Elliot
        pass
