#include<iostream>
#include<unordered_map>
using namespace std;
int main(){
    ios_base::sync_with_stdio(0);
    cin.tie(0);cout.tie(0);
    
    int tc,n,timeRequired,totalTime,i;
    string str;
    unordered_map<string,int>::const_iterator itr;
    cin>>tc;
    while(tc--){
        cin>>n;
        totalTime=0;
        unordered_map<string,int> known_words;
        while(n--){
            cin>>str;
            timeRequired=0;
            itr=known_words.find(str); 
            if(itr==known_words.end()){
                timeRequired+=2;
                for(i=1;i<str.length();i++){
                    if(((str[i]=='d'||str[i]=='f')&&(str[i-1]=='j'||str[i-1]=='k'))||((str[i]=='j'||str[i]=='k')&&(str[i-1]=='d'||str[i-1]=='f'))){
                        timeRequired+=2;
                    }
                    else
                        timeRequired+=4;
                }
                totalTime+=timeRequired;
                pair<string,int> myPair(str,timeRequired);
                known_words.insert(myPair);
            }
            else{
                totalTime+=itr->second/2;
            }
            /*for(itr=known_words.begin();itr!=known_words.end();itr++){
                cout<<itr->second<<endl;
            }*/            
        }
        cout<<totalTime<<endl;
    }
    return 0;
}