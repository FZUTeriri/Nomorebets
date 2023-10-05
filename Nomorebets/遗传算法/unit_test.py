import itertools
import unittest
from game import mul_power
from cal_expect import expect,init_expect

init_expect

dice = [[1, 2, 3, 4, 6], [1, 2, 3, 4, 5], [1, 1, 2, 2, 3], [3, 3, 3, 4, 4],
        [4, 4, 4, 5, 6], [5, 5, 5, 5, 6], [6, 6, 6, 6, 6], [1, 1, 2, 4, 6]]
expects = [48.5, 75.0, 29.978395061728396, 38.22222222222222, 41.22222222222222, 73.5, 130.0, 30.978395061728392]
chips_sub = [1000, 2000, -3100, 5000, -4200]
score_sub = [10, 20, 30, 40, 50]
rem_innings = [1000, 1200, 2300, 2100, 3400]
multi_power = [3, 3, 3, 3, 3]


def calculate_expect(test_dice):
    max_expect = []
    m_expect = -1
    for i in range(6):  # 0到count个骰子
        combinations = itertools.combinations(test_dice, i)  # 生成i个骰子的组合
        for combination in combinations:
            index = 0
            l = len(combination)
            for j in range(l):
                index *= 6
                index += combination[j]
            if expect[index] > m_expect:
                m_expect = expect[index]
    max_expect.append(m_expect)
    return max_expect


class Mytest(unittest.TestCase):

    def test_calculate_expect(self):

        dice_expect = []
        for test_dice in dice:
            dice_expect += calculate_expect(test_dice)
        self.assertEqual(dice_expect, expects)

    def test_mul_power(self):
        print("开始测试mul_power函数")
        power = []
        for i in range(5):
            power.append(mul_power(-108.79908256525293, 158.38854064873104, -47.57462427464868,
                                   chips_sub[i], score_sub[i], rem_innings[i]))
        self.assertEqual(multi_power, power)


if __name__ == '__main__':
    unittest.main()
