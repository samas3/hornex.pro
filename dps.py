import math
from tkinter import *
from mob import *
speed = {
    'Co': 0.3,
    'Un': 0.5,
    'Ra': 0.7,
    'Ep': 0.9,
    'Le': 1.1,
    'My': 1.3,
    'Ul': 1.5,
    'Su': 1.7,
    'Hy': 1.9
}
class Petal:
    def __init__(self, rarity, petal):
        self.petal = petal
        self.rarity = rarity
        self.health = bonus[rarity] * petals[petal][0]
        self.cur = self.health
        self.damage = bonus[rarity] * petals[petal][1]
        self.reload = petals[petal][2]
        self.cd = 0
    def __repr__(self):
        return self.rarity + self.petal
def calc(p, atk):
    atk = bonus[atk[:2]] * mobsatk[atk[2:]]
    lst = []
    spin = 2.5
    tot1 = 0
    clockwise = -1
    maxreload = -1
    maxhealth = -1
    for i in p:
        x = Petal(i[:2], i[2:])
        lst.append(x)
        if x.petal == 'Faster':
            spin += speed[x.rarity]
        if x.petal == 'YinYang':
            clockwise *= -1
        if x.petal in petals:
            tot1 += x.damage
    lap = 2 * math.pi / spin
    for i, j in enumerate(lst):
        maxreload = max(maxreload, j.reload + i / len(lst) * lap)
        maxhealth = max(maxhealth, j.health / atk)
    def hitcount(petal, time, atk, offset):
        cnt = 0
        cur = offset
        while cur <= time:
            if petal.cur <= 0 and cur - petal.cd >= petal.reload:
                petal.cur = petal.health
            if petal.cur > 0:
                cnt += 1
                if petal.petal == 'Bone' and atk <= petal.health:
                    pass
                else:
                    petal.cur -= atk
                if petal.cur <= 0:
                    petal.cd = cur
            cur += lap
        return cnt
    tot2 = 0
    time = max(lap, maxreload)
    time = max(time, maxhealth * lap)
    petaldmg = []
    for i, j in enumerate(lst):
        x = hitcount(j, time, atk, (i * clockwise % len(lst)) / len(lst) * lap)
        tot2 += x * j.damage
        petaldmg.append([j, x * j.damage])
    return lap, tot1, time, tot2, petaldmg
t = Tk()
t.title('Hornex.PRO dps计算')
Label(t, text='花瓣', font=('', 15)).grid(row=0, column=0)
pt = Entry(t, font=('', 15), width=80)
pt.grid(row=0, column=1)
Label(t, text='目标', font=('', 15)).grid(row=1, column=0)
tar = Entry(t, font=('', 15))
tar.grid(row=1, column=1)
res = Label(t, font=('', 20))
res.grid(row=3, column=0, columnspan=2)
dmg = Text(t, font=('', 13), height=18, width=30)
dmg.grid(row=4, column=0, columnspan=2)
def do():
    a, b, c, d, e = calc(pt.get().strip().split(), tar.get())
    e = sorted(e, key=lambda x:-x[1])
    res['text'] = f'单圈时间: {round(a, 2)} s\n' \
    f'一轮时间: {round(c, 2)} s\n一轮输出: {int(d)}\n一轮dps: {int(d / c)}\n' \
    f'预计击杀时间: {round(applyHealth(tar.get()[:2], tar.get()[2:]) / (d / c), 2)} s\n' \
    f'分别造成伤害: '
    #f'爆发输出: {int(b)}\n爆发dps: {int(b / a)}\n' \
    dmg.delete(1.0, 'end')
    for i in e:
        dmg.insert('end', f'{str(i[0])} {str(int(i[1]))}\n')
Button(t, text='计算', command=do).grid(row=2, column=0, columnspan=2)
t.mainloop()