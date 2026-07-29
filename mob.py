from tkinter import *
petals = {
    # health, damage, reload
    'Basic': [10, 10, 2.5],
    'Missile': [2, 55, 2.5],
    'Rose': [5, 5, 3.5],
    'Iris': [5, 5 + 50, 4],
    'Rock': [200, 30, 5],
    'Stinger': [2, 160, 10],
    'Lightning': [20, 8 + 20, 2.5],
    'Soil': [20, 20, 1.5],
    'Light': [5, 10, 0.6],
    'Cotton': [15, 1, 1],
    'Magnet': [15, 5, 1.5],
    'Peas': [25, 25, 1],
    'YinYang': [10, 20, 1.5],
    'Web': [5, 5, 3.5],
    'Grapes': [20, 3 + 40, 2],
    'Heavy': [600, 20, 10],
    'Faster': [5, 8, 2.5],
    'Pollen': [5, 20, 1],
    'Wing': [10, 35, 2.5],
    'Swastika': [40, 50, 2.5],
    'Cactus': [15, 10, 1],
    'Leaf': [10, 10, 1],
    'Sand': [5, 20, 1.4],
    'Powder': [15, 20, 1.5],
    'Dahlia': [5, 5, 1.5],
    'Lightsaber': [300, 10, 2],
    'Poo': [5, 5, 2.5],
    'Starfish': [7, 10, 1.5],
    'Dandelion': [5, 5, 1],
    'Shell': [25, 5, 3.5],
    'Rice': [1, 4, 0.05],
    'Pincer': [5, 6 + 20, 1.5],
    'Sponge': [500, 1, 2.5],
    'Arrow': [500, 5, 2],
    'Coffee': [5, 5, 2],
    'Bone': [10, 15, 2], # Armor
    'Fire': [120, 20, 2],
    'Gas': [200, 0.5 + 40, 2],
    'Snail': [30, 25, 1.5],
    'Taco': [5, 5, 2.5],
    'Banana': [400, 2, 1],
    'Pacman': [15, 2, 1],
    'Honey': [20, 10, 2],
    'Pill': [5, 2, 0.5],
    'Turtle': [1600, 0.1, 1.5],
    'Cement': [100, 50, 2.5],
    'Sunflower': [10, 10, 1],
    'Stickbug': [10, 18, 1],
    'Mushroom': [5, 5, 0.8],
    'Sword': [5, 21, 1],
    'Avacado': [70, 1, 2],
    'Dice': [20, 10, 1.6]
}
mobsatk = {
    'Bee': 50,
    'Cactus': 5,
    'Rock': 10,
    'Hornet': 50,
    'Ladybug': 10,
    'AntHole': 10,
    'QueenAnt': 10,
    'SoldierAnt': 10,
    'WorkerAnt': 10,
    'BabyAnt': 10,
    'FireAntHole': 20,
    'QueenFireAnt': 20,
    'SoldierFireAnt': 20,
    'WorkerFireAnt': 20,
    'BabyFireAnt': 20,
    'Beetle': 30,
    'Spider': 15 + 15,
    'Scorpion': 15 + 10,
    'Yoba': 40,
    'Jellyfish': 25 + 5,
    'Bubble': 5,
    'Centipede': 10,
    'EvilCentipede': 10,
    'DesertCentipede': 10,
    'DarkLadybug': 10,
    'YellowLadybug': 10,
    'Bush': 10,
    'Sandstorm': 40,
    'Petaler': 40,
    'Starfish': 20,
    'Dandelion': 15,
    'Shell': 10,
    'Crab': 25,
    'SpiderYoba': 30,
    'Sponge': 10,
    'M28': 35,
    'Guardian': 35,
    'Dragon': 20,
    'Snail': 30,
    'Pacman': 35,
    'Ghost': 0.1,
    'Beehive': 40,
    'Turtle': 40,
    'SpiderCave': 40,
    'Statue': 10,
    'Tumbleweed': 40,
    'DragonNest': 50,
    'Furry': 30,
    'Nigersaurus': 100,
    'Sunflower': 5,
    'Stickbug': 20,
    'Mushroom': 20,
    'Fossil': 30,
    'PedoX': 20,
    'Avacado': 5,
    'Dice': 5
}
mobshealth = {
    'Bee': 37.5,
    'Cactus': 94,
    'Rock': 75,
    'Hornet': 62.5,
    'Ladybug': 87.5,
    'AntHole': 750,
    'QueenAnt': 500,
    'SoldierAnt': 100,
    'WorkerAnt': 62.5,
    'BabyAnt': 25,
    'FireAntHole': 750,
    'QueenFireAnt': 500,
    'SoldierFireAnt': 100,
    'WorkerFireAnt': 62.5,
    'BabyFireAnt': 25,
    'Beetle': 100,
    'Spider': 62.5,
    'Scorpion': 100,
    'Yoba': 350,
    'Jellyfish': 125,
    'Bubble': 0.5,
    'Centipede': 25,
    'EvilCentipede': 25,
    'DesertCentipede': 25,
    'DarkLadybug': 87.5,
    'YellowLadybug': 87.5,
    'Bush': 50,
    'Sandstorm': 125,
    'Petaler': 125,
    'Starfish': 150,
    'Dandelion': 25,
    'Shell': 225,
    'Crab': 150,
    'SpiderYoba': 100,
    'Sponge': 100,
    'M28': 100,
    'Guardian': 200,
    'Dragon': 200,
    'Snail': 120,
    'Pacman': 120,
    'Ghost': 150,
    'Beehive': 500,
    'Turtle': 80,
    'SpiderCave': 500,
    'Statue': 100,
    'Tumbleweed': 60,
    'DragonNest': 600,
    'Furry': 200,
    'Nigersaurus': 60,
    'Sunflower': 90,
    'Stickbug': 50,
    'Mushroom': 50,
    'Fossil': 100,
    'PedoX': 150,
    'Avacado': 50,
    'Dice': 100
}
bonus = {
    'Co': 3 ** 0,
    'Un': 3 ** 1,
    'Ra': 3 ** 2,
    'Ep': 3 ** 3,
    'Le': 3 ** 4,
    'My': 3 ** 5,
    'Ul': 3 ** 6,
    'Su': 3 ** 7,
    'Hy': 3 ** 8
}
mobHealth = {
    'Co': 1,
    'Un': 3.75,
    'Ra': 3.6,
    'Ep': 4,
    'Le': 7.5,
    'My': 6,
    'Ul': 15,
    'Su': 12,
    'Hy': 15
}
def applyHealth(rarity, mob):
    res = 1
    for i in range(list(mobHealth.keys()).index(rarity) + 1):
        res *= mobHealth[list(mobHealth.keys())[i]]
    return mobshealth[mob] * res
def main():
    t = Tk()
    t.title('Hornex.PRO 怪物图鉴')
    m = Entry(t, font=('', 20))
    m.pack()
    res = Label(t, font=('', 20))
    res.pack()
    def query():
        r = m.get()[:2]
        p = m.get()[2:]
        res['text'] = f'血量: {int(applyHealth(r, p))}\n伤害: {int(bonus[r] * mobsatk[p])}'
    Button(t, text='查询', command=query).pack()
    t.mainloop()
if __name__ == '__main__':
    main()
def listdps():
    dps = []
    for i, j in petals.items():
        dps.append([i, j[1] / j[2]])
    dps = sorted(dps, key=lambda x: -x[1])
    print(dps)
listdps()