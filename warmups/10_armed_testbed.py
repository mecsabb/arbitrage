import numpy as np
import matplotlib.pyplot as plt
import random

runs = 2000 # number of tests
steps = 1000 # number of time steps
k = 10 # bandit arms

true_vals = np.random.normal(0, 1, (runs, k)) # randomly generated true value functions
optimal = np.argmax(true_vals, 1) # optimal actions for each run

eps = [0, 0.01, 0.1, 1] # epsilon values to be tested

for ep in range(len(eps)):
    
    print('Epsilon: ', eps[ep])

    R = np.zeros((runs, k)) # array of value estimates, initially zero
    N = np.ones((runs, k)) # array with number of times each action is taken
    
    Q = np.random.normal(true_vals, 1) # initial action

    # array to store each action
    eps_arr = []
    eps_arr.append(0)
    eps_arr.append(np.mean(Q))
    optimal_eps_arr = []

    for step in range(2, steps + 1):

        arr_step = [] # array to store the rewards in this time step
        optimal_arm = 0 # number of times optimal action is taken, initially zero

        for m in range(runs):

            # random action is taken with epsilon frequency, otherwise, greedy action is taken
            if (random.random() < eps[ep]):
                n = np.random.randint(k)
            else:   
                n = np.argmax(R[m])

            if (n == optimal[m]):
                optimal_arm = optimal_arm + 1
            
            # add reward
            temp = np.random.normal(true_vals[m][n], 1)
            arr_step.append(temp)
            N[m][n] = N[m][n] + 1 # increment the number of times action is taken
            R[m][n] = R[m][n] + (temp - R[m][n])/N[m][n] # update respective value estimate
        
        avg_step = np.mean(arr_step)
        eps_arr.append(avg_step)
        optimal_eps_arr.append(float(optimal_arm) * 100 / 2000)
