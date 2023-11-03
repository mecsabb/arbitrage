
import random

def choose_action(k,exploration_prob,rewards):
    #generate random float between 0 and 1 to decide if doing exploration
        if random.random() < exploration_prob:
            #a is a random action: action 0 to k-1
            return int(random.random()*k)
        else:
            best_mean = 0
            best_a = 0
            for i in range(0,k):
                ilist = [a for a in rewards if a == i]
                icount = len(ilist)
                isum = sum(ilist)
                if icount > 0:
                    imean = isum/icount
                else:
                    imean = 0
                if imean > best_mean: 
                    beat_mean = imean
                    best_a = i
            return best_a

def take_action(a,mean_rewards,reward_variance):
    mean_reward = mean_rewards[a]
    var = random.random()*reward_variance
    if random.choice([True, False]) == True:
        return mean_reward+var
    return mean_reward-var

#MAIN
def run_kbandit(n,k,reward_variance,exploration_prob,reward_range):
    #randomly generate the mean reward for the k actions. It will be between 0 and the range upper value
    mean_rewards = []
    for i in range(0,k):
        mean_rewards.append(int(random.random()*reward_range))

    #list of all scores and cooresponding actions
    rewards = [[],[]]

    for i in range(0,n):
        a = choose_action(k,exploration_prob,rewards)
        reward = take_action(a,mean_rewards,reward_variance)
        rewards[0].append(a)
        rewards[1].append(take_action(a,mean_rewards,reward_variance))
        

    return rewards