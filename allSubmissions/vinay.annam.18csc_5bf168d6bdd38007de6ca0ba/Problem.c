#include<stdio.h>

int main(){
	int n;
    scanf("%d", &n);
    while(n != 0){
        int a, b;
        scanf("%d %d", &a, &b);
        printf("%d\n", a+b);
        n--;
    }
}