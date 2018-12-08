t=int(raw_input())
for i in range(t):
    n=int(raw_input())
    input_words=[]
    total=0
    for i in range(n):
        x=raw_input()
        rh=['j','k']
        lh=['d','f']
        d=0
        c=0
        for i in range(0,len(x)):
            if(x[i] in rh and x[i-1] in rh and d>0):
                c+=4
            elif(x[i] in lh and x[i-1] in lh and d>0):
                c+=4
            else:
                c+=2
            d+=1
        if x in input_words:
            c=c//2
        input_words.append(x)
        total+=c
    print(total)