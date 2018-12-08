# Your code goes here

n = int(input())
while n != 0:
    s = raw_input()
    s = s.split(' ')
    print(int(s[0])+int(s[1]))
    n -= 1
