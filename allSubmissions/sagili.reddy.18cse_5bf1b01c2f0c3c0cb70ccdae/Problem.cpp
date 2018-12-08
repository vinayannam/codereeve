#include<iostream>
#include<map>
#include<string>

using namespace std;
int main()
{

    int t;
    cin >> t;
    while (t--)
    {
        int n;
        cin >> n;
        long long int total_time = 0;
        map<string, long long int> ss;
        for (int i = 0; i<n; i++)
        {
            string s;
            cin >> s;
            if (ss.find(s) != ss.end())
                total_time += ss[s] / 2;
            else {
                ss[s] += 2;
                for (int j = 1; j<s.length(); j++)
                {
                    if (s[j] == 'd' || s[j] == 'f')
                    {
                        if (s[j - 1] == 'd' || s[j - 1] == 'f')
                            ss[s] += 4;
                        else
                            ss[s] += 2;
                    }
                    else
                    {
                        if (s[j - 1] == 'd' || s[j - 1] == 'f')
                            ss[s] += 2;
                        else
                            ss[s] +=4;
                    }
                }
                total_time += ss[s];
            }

        }
        cout << total_time << endl;
    }
    return 0;
}
