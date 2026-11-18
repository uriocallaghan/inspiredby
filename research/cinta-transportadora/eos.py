import gsw
def eos80(S,T):
  rw=999.842594+6.793952e-2*T-9.095290e-3*T**2+1.001685e-4*T**3-1.120083e-6*T**4+6.536332e-9*T**5
  A=0.824493-4.0899e-3*T+7.6438e-5*T**2-8.2467e-7*T**3+5.3875e-9*T**4
  B=-5.72466e-3+1.0227e-4*T-1.6546e-6*T**2
  C=4.8314e-4
  return rw+A*S+B*S**1.5+C*S**2
for S,T in [(0,4),(35,25),(35,0),(36.5,24),(34.9,3),(34.85,3.2),(33,0),(32,-1.5),(38.4,13),(35,10),(36,20),(34,-1.8)]:
  SA=gsw.SA_from_SP(S,0,-30,55); CT=gsw.CT_from_t(SA,T,0)
  print(S,T,'eos80 %.3f'%eos80(S,T),'teos10 %.3f'%gsw.rho(SA,CT,0),'diff %.3f'%(eos80(S,T)-gsw.rho(SA,CT,0)))
print('freezing S35', gsw.t_freezing(gsw.SA_from_SP(35,0,-30,55),0,0), 'S32',gsw.t_freezing(gsw.SA_from_SP(32,0,-30,55),0,0))
