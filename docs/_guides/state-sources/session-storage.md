---
layout: page
title: Session Storage State Source
id: session-storage-state-source
section: State Sources
---

The Session Storage State Source allows you to persist data to [sessionStorage](https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage#sessionStorage).

{% highlight js %}
var FooStorage = Marty.createStateSource({
  type: 'sessionStorage',
  saveFoo: function (foo) {
    this.set('foo', foo);
  },
  getFoo: function () {
    return this.get('foo');
  }
});

FooStorage.saveFoo('Foo');
{% endhighlight %}