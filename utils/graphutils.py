'''
graphutils - a utility module containing our main graph class definiton some useful functions
'''

import networkx as nx
import random
import string
import time

class Graph:
    def __init__(self):
        self.graph = nx.DiGraph()
    
    def add_node(self, name):
        self.graph.add_node(name)
    
    def add_edge(self, u, v, weight=1):
        # u, v are nodes
        self.graph.add_edge(u, v, weight=weight)

    def bellman_ford(self, source):
        """
        Executes the Bellman-Ford algorithm on the graph from a given source node,
        and measures the time it takes to execute.
        
        Returns a tuple with the execution time followed by two dictionaries 
        representing the distance to each node and the predecessor of each node.
        """
        # Check if the source node is in the graph
        if source not in self.graph.nodes:
            raise ValueError("Source node not found in graph")

        start_time = time.time()

        # Prepare the distance and predecessor for each node
        distance = {node: float('inf') for node in self.graph.nodes}
        predecessor = {node: None for node in self.graph.nodes}
        distance[source] = 0

        # Relax the edges
        for _ in range(len(self.graph) - 1):
            for u, v, attr in self.graph.edges(data=True):
                weight = attr['weight']
                if distance[u] + weight < distance[v]:
                    distance[v] = distance[u] + weight
                    predecessor[v] = u

        # Check for negative weight cycles
        for u, v, attr in self.graph.edges(data=True):
            weight = attr['weight']
            if distance[u] + weight < distance[v]:
                end_time = time.time()
                print(
                    f"Execution time before detecting negative cycle: {end_time - start_time:.5f} seconds")
                raise nx.NetworkXUnbounded(
                    "Graph contains a negative weight cycle.")

        end_time = time.time()
        execution_time = end_time - start_time

        return execution_time, distance, predecessor

    # What else is convenient / needed?

class GraphGenerator:
    def __init__(self, min_weight=1.0, max_weight=10.0, max_nodes=26):
        if min_weight > max_weight:
            raise ValueError("Minimum weight cannot be greater than maximum weight")
        self.min_weight = min_weight
        self.max_weight = max_weight
        self.max_nodes = max_nodes

    def _generate_node_name(self, index):
        """
        Generates a node name based on the index. For indices greater than 26,
        it starts combining letters.
        """
        if index < 26:
            return string.ascii_uppercase[index]
        else:
            return self._generate_node_name(index // 26 - 1) + self._generate_node_name(index % 26)

    def generate_graph(self, num_nodes, num_edges):
        """
        Generates a graph with the specified number of nodes and edges.
        """
        if num_nodes > self.max_nodes:
            raise ValueError("Number of nodes exceeds maximum allowed nodes.")

        graph = Graph()

        # Add nodes
        for i in range(num_nodes):
            node_name = self._generate_node_name(i)
            graph.add_node(node_name)

        # Add edges
        all_possible_edges = [(u, v) for u in graph.graph.nodes for v in graph.graph.nodes if u != v]
        random.shuffle(all_possible_edges)  # Shuffle to randomize edge selection

        for _ in range(num_edges):
            if not all_possible_edges:
                break  # Break if there are no more possible edges to add
            u, v = all_possible_edges.pop()
            weight = random.uniform(self.min_weight, self.max_weight)
            graph.add_edge(u, v, weight)

        return graph

    def generate_fully_connected_graph(self, num_nodes):
        """
        Generates a fully connected graph with the specified number of nodes.
        Each pair of nodes will have edges in both directions with random weights.
        """
        if num_nodes > self.max_nodes:
            raise ValueError("Number of nodes exceeds maximum allowed nodes.")

        graph = Graph()

        # Add nodes
        for i in range(num_nodes):
            node_name = self._generate_node_name(i)
            graph.add_node(node_name)

        # Add edges in both directions for each pair of nodes
        for i in range(num_nodes):
            for j in range(num_nodes):
                if i != j:
                    weight = random.uniform(self.min_weight, self.max_weight)
                    graph.add_edge(self._generate_node_name(i), self._generate_node_name(j), weight)

        return graph

if __name__ == '__main__':
    # Create a custom graph and add nodes and edges
    try:
        g = Graph()
        g.add_node("A")
        g.add_node("B")
        g.add_node("C")

        g.add_edge("A", "B", -1)
        g.add_edge("B", "C", 4)
        g.add_edge("A", "C", 3)

        # Run the Bellman-Ford algorithm
        execution_time, distance, predecessor = g.bellman_ford("A")

        print(f"Bellman-Ford algorithm executed in {execution_time:.5f} seconds")
        print("Distance:", distance)
        print("Predecessor:", predecessor)

    except Exception as e:
        print(f"An error occurred: {e}")
