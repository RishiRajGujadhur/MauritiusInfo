from html.parser import HTMLParser
class Node:
 def __init__(self,tag='',attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.children=[];self.parent=parent;self.parts=[]
 @property
 def text(self):return '' if self.tag in ['script','style','noscript'] else ' '.join(' '.join(p.text if isinstance(p,Node) else p for p in self.parts).split())
 def all(self,tag=None,cls=None):
  out=[]
  for c in self.children:
   if (tag is None or c.tag==tag) and (cls is None or cls in c.attrs.get('class','').split()):out.append(c)
   out+=c.all(tag,cls)
  return out
class Tree(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.root=Node();self.current=self.root;self.feed(text)
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs,self.current);self.current.children.append(n);self.current.parts.append(n)
  if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.current=n
 def handle_endtag(self,tag):
  n=self.current
  while n.parent:
   if n.tag==tag:self.current=n.parent;return
   n=n.parent
 def handle_data(self,data):self.current.parts.append(data)
