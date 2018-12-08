# from bs4 import BeautifulSoup
# html_doc = '<HTML><HEAD><TITLE>Moss Results</TITLE></HEAD><BODY>Moss Results<p>Sun Nov 11 08:37:18 PST 2018<p>Options -l python -m 10<HR>[ <A HREF="http://moss.stanford.edu/general/format.html" TARGET="_top"> How to Read the Results</A> | <A HREF="http://moss.stanford.edu/general/tips.html" TARGET="_top"> Tips</A> | <A HREF="http://moss.stanford.edu/general/faq.html"> FAQ</A> | <A HREF="mailto:moss-request@cs.stanford.edu">Contact</A> | <A HREF="http://moss.stanford.edu/general/scripts.html">Submission Scripts</A> | <A HREF="http://moss.stanford.edu/general/credits.html" TARGET="_top"> Credits</A> ]<HR><TABLE><TR><TH>File 1<TH>File 2<TH>Lines Matched<TR><TD><A HREF="http://moss.stanford.edu/results/50282727/match0.html">submission/a01-sample.py (93%)</A><TD><A HREF="http://moss.stanford.edu/results/50282727/match0.html">submission/a01-sample.py (93%)</A><TD ALIGN=right>8<TR><TD><A HREF="http://moss.stanford.edu/results/50282727/match1.html">submission/a01-sample.py (93%)</A><TD><A HREF="http://moss.stanford.edu/results/50282727/match1.html">submission/a01-p146099.py (93%)</A><TD ALIGN=right>8<TR><TD><A HREF="http://moss.stanford.edu/results/50282727/match2.html">submission/a01-sample.py (93%)</A><TD><A HREF="http://moss.stanford.edu/results/50282727/match2.html">submission/a01-p146011.py (93%)</A><TD ALIGN=right>11<TR><TD><A HREF="http://moss.stanford.edu/results/50282727/match3.html">submission/a01-p146099.py (93%)</A><TD><A HREF="http://moss.stanford.edu/results/50282727/match3.html">submission/a01-sample.py (93%)</A><TD ALIGN=right>8<TR><TD><A HREF="http://moss.stanford.edu/results/50282727/match4.html">submission/a01-p146099.py (93%)</A><TD><A HREF="http://moss.stanford.edu/results/50282727/match4.html">submission/a01-p146011.py (93%)</A><TD ALIGN=right>11<TR><TD><A HREF="http://moss.stanford.edu/results/50282727/match5.html">submission/a01-p146011.py (93%)</A><TD><A HREF="http://moss.stanford.edu/results/50282727/match5.html">submission/a01-sample.py (93%)</A><TD ALIGN=right>11</TABLE><HR>Any errors encountered during this query are listed below.<p></BODY></HTML>'
# soup = BeautifulSoup(html_doc, 'html.parser')

# a = soup.find('table').find_all('a')
# s = []

# for i in range(int(len(a)/2)):
#     left = a[i].get_text()
#     right = a[i+1].get_text()
#     if(left != right):
#         s.append(a[i].get_text()+' '+a[i+1].get_text())
# print(s)



n = int(input())
while n != 0:
    s = input()
    s = s.split(' ')
    print(int(s[0])+int(s[1]))
    n -= 1
