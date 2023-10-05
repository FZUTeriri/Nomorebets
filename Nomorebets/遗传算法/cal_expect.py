import numpy as np
import csv

expect = np.zeros(9331, dtype=float)

class Result:
    def __init__(self):
        self.score = 0
        self.child = 0
        self.expect = 0


def judge_shun(a):
    num = [0] * 7
    for i in range(5):
        num[a[i]] += 1
    if all(num[i] == 1 for i in range(1, 6)):
        return 60
    if all(num[i] == 1 for i in range(2, 7)):
        return 60
    if all(num[i] >= 1 for i in range(1, 5)):
        return 30
    if all(num[i] >= 1 for i in range(2, 6)):
        return 30
    if all(num[i] >= 1 for i in range(3, 7)):
        return 30
    return 0


def judge_four(a):
    count = 0
    max_count = 0
    for i in range(4):
        if a[i] == a[i + 1]:
            count += 1
        else:
            max_count = max(max_count, count)
            count = 0
    max_count = max(max_count, count)
    if max_count == 3:
        return 1
    else:
        return 0


def judge_hulu(a):
    if a[2] == a[1] and a[0] == a[2] and a[0] == a[1] and (a[3] == a[4]):
        return 1
    if (a[2] == a[3] and a[4] == a[2] and a[3] == a[4]) and (a[0] == a[1]):
        return 1
    return 0


def judge_three(a):
    if a[2] == a[1] and a[0] == a[2] and a[0] == a[1]:
        return 1
    if a[1] == a[2] and a[1] == a[3] and a[2] == a[3]:
        return 1
    if a[2] == a[3] and a[4] == a[2] and a[3] == a[4]:
        return 1
    return 0


def judge_two(a):
    a.sort()
    if a[0] == a[1] and a[2] == a[3]:
        return 1
    if a[1] == a[2] and a[3] == a[4]:
        return 1
    if a[0] == a[1] and a[3] == a[4]:
        return 1
    return 0


def get_score(a):
    a.sort()
    basic = sum(a)
    price = 0
    price = judge_shun(a)
    if price != 0:
        return basic + price
    elif all(x == a[0] for x in a):
        return basic + 100
    elif judge_four(a) == 1:
        return basic + 40
    elif judge_hulu(a) == 1:
        return basic + 20
    elif judge_three(a) == 1 or judge_two(a) == 1:
        return basic + 10
    return basic


def tree_push(x1, x2, x3, x4, x5, num):
    index = ((((0 * 6 + x1) * 6 + x2) * 6 + x3) * 6 + x4) * 6 + x5
    expect[index] = num


def get_all_expect(depth, index):
    if depth >= 5:
        return
    for i in range(1, 7):
        get_all_expect(depth + 1, index * 6 + i)
        expect[index] += expect[index * 6 + i]
    expect[index] /= 6.0

def init_expect():
    a = [0] * 5
    res = np.zeros((6, 6, 6, 6, 6), dtype=int)

    for i1 in range(6):
        for i2 in range(6):
            for i3 in range(6):
                for i4 in range(6):
                    for i5 in range(6):
                        a[0] = i1 + 1
                        a[1] = i2 + 1
                        a[2] = i3 + 1
                        a[3] = i4 + 1
                        a[4] = i5 + 1
                        res[i1][i2][i3][i4][i5] = get_score(a)
                        tree_push(i1 + 1, i2 + 1, i3 + 1, i4 + 1, i5 + 1, res[i1][i2][i3][i4][i5])

    get_all_expect(0, 0)
    expect[0] = expect[1] + expect[2] + expect[3] + expect[4] + expect[5] + expect[6]
    expect[0] /= 6.0


if __name__ == "__main__":

    # 将expect数组的数据写入CSV文件
    with open('expect.csv', 'w', newline='') as csvfile:
        csvwriter = csv.writer(csvfile)

        # 写入数据
        for i in range(len(expect)):
            csvwriter.writerow([expect[i]])
