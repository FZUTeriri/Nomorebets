import random
import itertools
import math
from cal_expect import get_score,expect,init_expect

init_expect()

def mul_power(alpha, beta, gamma, chips_sub, scores_sub, round_sub):
    # print(chips_sub)
    # print(scores_sub)
    # print(round_sub)
    if chips_sub > 0:
        chips_sub = math.log(abs(chips_sub))
    elif chips_sub < 0:
        chips_sub = -math.log(abs(chips_sub))
    if round_sub != 0:
        round_sub = math.log(abs(round_sub))
    if -10 <= chips_sub <= 10 and 0 <= round_sub <= 10:
        judge = alpha * chips_sub + beta * scores_sub + gamma * round_sub
        if 120 < judge:
            return 3
        elif 0 < judge <= 120:
            return 2
        elif -120 < judge <= 0:
            return 1
        elif judge <= -120:
            return 0
    return 0


class DiceGame:
    def __init__(self, alpha=0, beta=0, gamma=0):
        self.players = []
        self.current_player = None
        self.round = 1
        self.max_rounds = 50
        self.winning_player = None
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma

    def start_game(self):
        # print("Welcome to the Dice Game!")
        self.setup_game()
        for i in range(10000):
            for j in self.players:
                j.re_init(1000)
            self.play_game()

    def setup_game(self):
        # num_rounds = int(input("Enter the number of rounds: "))
        # self.max_rounds = num_rounds
        for i in range(2):
            # [input(f"Enter the name of Player {i + 1}: ")]
            # int(input(f"Enter the number of chips for {player_name}: "))
            player_name = [f"player{i + 1}"]
            player_chips = 5000
            self.players.append(Player(player_name, player_chips))

    def play_game(self):
        while self.round <= self.max_rounds:
            if self.players[0].chips < 0 or self.players[1].chips < 0:
                break
            self.players[0].index = 0
            self.players[1].index = 0
            # print(f"\nRound {self.round}")
            self.players[0].reset_dice()
            self.players[1].reset_dice()
            #两轮选骰
            for i in range(2):
                for player in self.players:
                    self.current_player = player
                    # print(f"\n{self.current_player.name}'s turn:")
                    self.play_round()
                # print(self.players[0].score)
                # print(self.players[1].score)

                for player in self.players:
                    self.current_player = player
                    self.calculate_score_sub(self.players[1 - self.players.index(player)])
                # print(self.players[0].score_sub)

                self.player1_choose_multiplier()
                self.player2_choose_multiplier()

            #三轮自动锁骰并计算得分
            for player in self.players:
                self.current_player = player
                self.auto_lock_dice()
                self.calculate_score()
            #得分高的胜利回合+1？？？？
            # if self.players[0].score > self.players[1].score:
            #     self.current_player = self.players[0]
            #     self.calculate_win_rounds()
            # elif self.players[0].score < self.players[1].score:
            #     self.current_player = self.players[1]
            #     self.calculate_win_rounds()

            #筹码流动
            for player in self.players:
                self.current_player = player
                self.calculate_chips(self.players[1 - self.players.index(player)])
                # self.display_chips()

            for player in self.players:
                self.current_player = player
                self.calculate_chips_sub(self.players[1 - self.players.index(player)])
            self.round += 1
        self.end_game()

    def play_round(self):
        self.roll_dice()
        self.display_dice()
        self.lock_dice()
        self.calculate_expect()

    def roll_dice(self):
        self.current_player.roll_dice()

    def display_dice(self):
        num = 5 - len(self.current_player.locked_dice)
        # print(f"{self.current_player.name}'s dice: {self.current_player.dice[:num]}")

    def lock_dice(self):
        # print(f"{self.current_player.name}'s locked_dice: {self.current_player.locked_dice}")
        if len(self.current_player.locked_dice) >= 5:
            # print("You already have 5 locked dice. You cannot lock more.")
            return
        self.current_player.dice.sort()
        dice = self.current_player.locked_dice
        all_combinations = []
        max_expect = -100
        max_index = self.current_player.index
        count = 5 - len(self.current_player.locked_dice)  # 剩余可选骰子数
        for i in range(count + 1):  # 0到count个骰子
            combinations = itertools.combinations(self.current_player.dice[:count], i)  # 生成i个骰子的组合
            all_combinations.extend(combinations)
        for combination in all_combinations:
            init_index=self.current_player.index
            for i in range(len(combination)):
                init_index = init_index * 6 + combination[i]
            if expect[init_index] > max_expect:
                max_expect = expect[init_index]
                max_index = init_index
                self.current_player.locked_dice = combination
        self.current_player.locked_dice = list(self.current_player.locked_dice)
        self.current_player.locked_dice += dice
        # print(self.current_player.locked_dice)
        self.current_player.index = max_index

    def auto_lock_dice(self):
        if len(self.current_player.locked_dice) < 5:
            num = 5 - len(self.current_player.locked_dice)
            random_dice = random.sample(self.current_player.dice, num)
            for dice in random_dice:
                self.current_player.locked_dice.append(dice)

    # 人机选择倍率方法
    def player1_choose_multiplier(self):
        multiplier = mul_power(-108.79908256525293, 158.38854064873104, -47.57462427464868, self.players[0].chips_sub,
                               self.players[0].score_sub, self.max_rounds - self.round)
        if 0 <= multiplier <= 3:
            self.current_player = self.players[0]
            self.current_player.choose_multiplier(multiplier)

    # 玩家选择倍率方式
    def player2_choose_multiplier(self):
        multiplier = mul_power(-157.7952002164841, 96.33460619059838, -47.72727177901695, self.players[1].chips_sub,
                               self.players[1].score_sub, self.max_rounds - self.round)
        if 0 <= multiplier <= 3:
            self.current_player = self.players[1]
            self.current_player.choose_multiplier(multiplier)
        # if self.players[1].score_sub > 5:
        #     multiplier = 3
        # else:
        #     multiplier = 0
        # if 0 <= multiplier <= 3:
        #     self.current_player = self.players[0]
        #     self.current_player.choose_multiplier(multiplier)

    # 计算当前玩家骰子得分
    def calculate_score(self):
        self.current_player.calculate_score()

    # 计算下一轮期望值
    def calculate_expect(self):
        self.current_player.calculate_expect()

    # 计算两者骰子分数差
    def calculate_score_sub(self, rival):
        self.current_player.calculate_score_sub(rival)

    # 计算筹码数
    def calculate_chips(self, rival):
        self.current_player.calculate_chips(rival)

    # 计算筹码差值
    def calculate_chips_sub(self, rival):
        self.current_player.calculate_chips_sub(rival)

    # 显示筹码数
    def display_chips(self):
        print(f"{self.current_player.name}'s chips: {self.current_player.chips}")

    # 结束游戏
    def end_game(self):
        # print("\nGame Over!")
        # print(self.round)
        # print("game over!")
        self.round = 1
        self.find_winning_player()
        # self.display_winner()

    # 得出获胜玩家
    def find_winning_player(self):
        self.winning_player = max(self.players, key=lambda player: player.chips)
        self.winning_player.win_rounds += 1

    # 计算获胜次数
    def calculate_win_rounds(self):
        self.current_player.calculate_win_rounds()

    # 显示获胜玩家
    def display_winner(self):
        print(f"{self.winning_player.name} wins with {self.winning_player.chips} chips!")


class Player:
    def __init__(self, name, chips):
        self.name = name
        self.chips = chips
        self.dice = [0] * 5
        self.locked_dice = []
        self.multiplier = 1
        self.score = 0
        self.chips_sub = 0
        self.score_sub = 0
        self.win_rounds = 0
        self.index = 0
    #重置参数
    def re_init(self,chips):
        self.chips = chips
        self.dice = [0] * 5
        self.locked_dice = []
        self.multiplier = 1
        self.score = 0
        self.chips_sub = 0
        self.score_sub = 0
        self.index = 0


    # 摇骰子
    def roll_dice(self):
        self.dice = [random.randint(1, 6) for _ in range(5)]

    # 锁骰子
    def lock_dice(self, positions):
        self.locked_dice.extend([self.dice[pos - 1] for pos in positions])

    # 倍率计算
    def choose_multiplier(self, multiplier):
        self.multiplier += multiplier

    # 重置骰子
    def reset_dice(self):
        self.dice = [0] * 5
        self.locked_dice = []
        self.multiplier = 1

    # 计算期望值
    def calculate_expect(self):
        self.locked_dice = list(self.locked_dice)
        self.locked_dice.sort()
        l = len(self.locked_dice)
        index = 0
        for i in range(l):
            index *= 6
            index += self.locked_dice[i]
        self.score = expect[index]

    # 计算骰子得分
    def calculate_score(self):
        self.score = get_score(self.locked_dice)

    # 计算骰子得分差值
    def calculate_score_sub(self, rival):
        self.score_sub = self.score - rival.score

    # 计算筹码数
    def calculate_chips(self, rival):
        self.chips += (self.score - rival.score) * (self.multiplier + rival.multiplier - 1)

    # 计算筹码差值
    def calculate_chips_sub(self, rival):
        self.chips_sub = self.chips - rival.chips

    # 计算胜利局数
    def calculate_win_rounds(self):
        self.win_rounds += 1


def play(alpha, beta, gamma):
    game = DiceGame(alpha, beta, gamma)
    game.start_game()
    return game.players[0].win_rounds


if __name__ == "__main__":
    print(play(-26.289655345061732, 51.4930398162031, 1.4808238435282561))
# import itertools
#
# dice = [1, 2, 3, 4, 5]  # 假设这是包含5个骰子的列表
#
# all_combinations = []
#
# # 生成0到5个骰子的所有组合
# for i in range(3):  # 0到5个骰子
#     combinations = itertools.combinations(dice[:3], i)  # 生成i个骰子的组合
#     all_combinations.extend(combinations)
#
# # all_combinations 中包含了所有可能的骰子组合
# for combination in all_combinations:
#     print(combination)
#
# # 获取组合的数量
# combination_count = len(all_combinations)
# print("组合数量:", combination_count)
