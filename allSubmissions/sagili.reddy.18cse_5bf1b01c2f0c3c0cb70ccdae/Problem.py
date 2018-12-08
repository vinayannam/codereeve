t=int(input())
left=['d','f']
right=['j','k']
for _ in range(t):
    n=int(raw_input())
    total=0
    words={}
    for _ in range(n):
        word=raw_input()
        time=2
        hand='r'
        if word[0] in left:
            hand='l'
        l=len(word)
        if word in words:
            time=words[word]//2
        else:
            for i in range(1,l):
                if word[i] in left:
                    if hand=='l':
                        time+=4
                    else:
                        time+=2
                    hand='l'
                else:
                    if hand=='r':
                        time+=4
                    else:
                        time+=2
                    hand='r'
            words[word]=time
        total+=time
    print(total)