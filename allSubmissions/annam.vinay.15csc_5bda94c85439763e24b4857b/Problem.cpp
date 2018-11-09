// You are writing in C++

#include<stdio.h>
int main(){
\
    int i = 0;
	scanf("%d", &i);
    int t;
    for(t=0; t<i; t++){
        int a, b;
        scanf("%d", &a);
        scanf("%d", &b);
        int c = a+b;
        printf("%d\n", c);
    }
}