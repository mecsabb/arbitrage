import gym
from gym import spaces
from gym.utils import seeding

from graphutils import Graph

class GraphEnv(gym.Env):
    """
    Custom Environment that following the gym interface.
    This is a simple env where the agent must reach from a start node to a goal node in the graph.
    """
    # Necessary? Saw this online...
    metadata = {'render.modes': ['human']}

    def __init__(self, graph: Graph):
        super(GraphEnv, self).__init__()

        # Define action and observation space - should be the number of connections on the current node,
        # must be a gym.spaces objects
        
        # Example when discrete actions (e.g., move left or right):
        n_actions = 2
        self.action_space = spaces.Discrete(n_actions)
        
        # Example for using image as input (can be replaced with any other observation space):
        self.observation_space = spaces.Box(
            low=0, high=255, shape=(100, 100, 3), dtype=int)

        # Graph behind the scenes
        self.graph = graph
        # Initialize the starting position of the agent in the graph.
        self.agent_node = None

    def step(self, action):
        # Execute one time step within the environment
        # Here, should update the environment's state based on the action taken,
        # calculate the reward for this step, determine whether the episode has ended,
        # and gather any additional information necessary for the agent's learning.

        # To be implemented: the logic for taking a step. This involves changing the state
        # of the environment and returning the new state, the reward, and whether the state is terminal.

        return observation, reward, done, info

    def reset(self):
        # Reset the state of the environment to an initial state
        # E.g., reset the agent to a starting node if it reaches a terminal state.
        self.agent_node = self._choose_start_node()

        # Return initial observation/state
        observation = ...  # TBD
        return observation

    def render(self, mode='human', close=False):
        # Render the environment to the screen or console.
        # This would be cool but may be difficult, could print text-based statuses.
        pass

    def close(self):
        # Perform any necessary cleanup.
        pass

    def seed(self, seed=None):
        # Sets the seed for this env's random number generator(s).
        self.np_random, seed = seeding.np_random(seed)
        return [seed]

    def _choose_start_node(self):
        # Logic for choosing a starting node in the graph.
        # This can be random, fixed, or based on specific criteria.
        pass
