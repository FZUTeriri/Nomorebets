import math

import numpy as np
import multiprocessing
from multiprocessing import Manager
from game import play

DNA_SIZE = 24
POP_SIZE = 200
CROSSOVER_RATE = 0.7
MUTATION_RATE = 0.005
N_GENERATIONS = 300
alpha_BOUND = [-200,0]
beta_BOUND = [0, 200]
gamma_BOUND = [-100, 100]
win_round = [0] * POP_SIZE


def get_fitness(win_round):
    try:
        win_rounds = [0] * POP_SIZE
        for i in range(len(win_round)):
            win_rounds[i] = win_round[i]
            win_rounds[i] /= 1000
        return win_rounds
    except Exception as e:
        for i in range(len(win_round)):
            print(type(win_round[i]))


def translateDNA(pop):
    dna_size = (3 * DNA_SIZE)
    # 划分pop矩阵以提取alpha、beta和gamma部分
    alpha_pop = pop[:dna_size // 3]
    beta_pop = pop[dna_size // 3: 2 * (dna_size // 3)]
    gamma_pop = pop[2 * (dna_size // 3):]

    # 将二进制编码转换为十进制
    alpha = (alpha_pop.dot(2 ** np.arange(dna_size // 3)[::-1]) / float(2 ** (dna_size // 3) - 1)) \
            * (alpha_BOUND[1] - alpha_BOUND[0]) + alpha_BOUND[0]
    beta = (beta_pop.dot(2 ** np.arange(dna_size // 3)[::-1]) / float(2 ** (dna_size // 3) - 1)) \
           * (beta_BOUND[1] - beta_BOUND[0]) + beta_BOUND[0]
    gamma = (gamma_pop.dot(2 ** np.arange(dna_size // 3)[::-1]) / float(2 ** (dna_size // 3) - 1)) \
            * (gamma_BOUND[1] - gamma_BOUND[0]) + gamma_BOUND[0]

    return alpha, beta, gamma


def crossover_and_mutation(pop, CROSSOVER_RATE=0.8):
    new_pop = []
    for father in pop:  # 遍历种群中的每一个个体，将该个体作为父亲
        child = father  # 孩子先得到父亲的全部基因（这里我把一串二进制串的那些0，1称为基因）
        if np.random.rand() < CROSSOVER_RATE:  # 产生子代时不是必然发生交叉，而是以一定的概率发生交叉
            mother = pop[np.random.randint(POP_SIZE)]  # 再种群中选择另一个个体，并将该个体作为母亲
            cross_points = np.random.randint(low=0, high=DNA_SIZE * 3)  # 随机产生交叉的点
            child[cross_points:] = mother[cross_points:]  # 孩子得到位于交叉点后的母亲的基因
        mutation(child)  # 每个后代有一定的机率发生变异
        new_pop.append(child)

    return new_pop


def mutation(child, MUTATION_RATE=0.003):
    if np.random.rand() < MUTATION_RATE:  # 以MUTATION_RATE的概率进行变异
        mutate_point = np.random.randint(0, DNA_SIZE * 3)  # 随机产生一个实数，代表要变异基因的位置
        child[mutate_point] = child[mutate_point] ^ 1  # 将变异点的二进制为反转


# def select(pop, fitness):
#     total_fitness = sum(fitness)  # 计算 fitness 列表中所有元素的总和
#     p = [value / total_fitness for value in fitness]  # 计算每个元素除以总和的结果，并存储在新的列表 p 中
#     idx = np.random.choice(np.arange(POP_SIZE), size=POP_SIZE, replace=True, p=p)
#     return pop[idx]


def select(pop, fitness):    # nature selection wrt pop's fitness
    all_sum = sum(fitness)
    for i in range(len(fitness)):
        fitness[i] /= all_sum
    idx = np.random.choice(np.arange(POP_SIZE), size=POP_SIZE, replace=True,
                           p=fitness)
    return pop[idx]


def print_info(pop):
    print(win_round)
    fitness = get_fitness(win_round)
    max_fitness_index = np.argmax(fitness)
    print("max_fitness:", fitness[max_fitness_index])
    alpha, beta, gamma = translateDNA(pop[max_fitness_index])
    print("最优的基因型：", pop[max_fitness_index])
    print("(alpha, beta, gamma):", alpha, beta, gamma)


def process_iteration(i, mul, ct, win_round):
    alpha, beta, gamma = translateDNA(mul)
    result = play(alpha, beta, gamma)

    with win_round.get_lock():
        win_round[i] = result

    print(f"第{ct}代;第{i+1}个权重: {result}")

if __name__ == "__main__":
    pop = np.random.randint(2, size=(POP_SIZE, DNA_SIZE * 3))  # matrix (POP_SIZE, DNA_SIZE)
    ct = 0
    num_processes = multiprocessing.cpu_count()  # 获取可用的 CPU 核心数
    for _ in range(N_GENERATIONS):  # 迭代N代
        ct += 1
        print(f"迭代次数:{ct}")
        processes = []  # Define the processes list
        pop = np.array(crossover_and_mutation(pop, CROSSOVER_RATE))
        win_round = multiprocessing.Array('i', [0] * len(pop))
        for i, mul in enumerate(pop):
            p = multiprocessing.Process(target=process_iteration, args=(i, mul, ct, win_round))
            processes.append(p)

        while processes:
            wait_p=[]
            for j in range(num_processes):
                if processes:
                    p = processes.pop(0)
                    wait_p.append(p)
                    p.start()

            for p in wait_p:
                p.join()
        # 获取修改后的 win_round 值
        final_win_round = list(win_round)
        # wt_ct = 1
        # for i, mul in enumerate(pop):
        #     alpha, beta, gamma = translateDNA(mul)
        #     win_round[i] = play(alpha, beta, gamma)
        #     print(f"第{ct}代;第{wt_ct}个权重")
        #     wt_ct += 1
        fitness = get_fitness(final_win_round)
        pop = select(pop, fitness)  # 选择生成新的种群
    print_info(pop)
