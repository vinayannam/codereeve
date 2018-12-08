#include<stdio.h>

int main(){
	int size;
    scanf("%d", &size);
    while(size != 0){
        int a1, a2;
        scanf("%d %d", &a1, &a2);
        printf("%d\n", a1+a2);
        size--;
    }
}