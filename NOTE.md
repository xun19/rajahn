// 参考：https://juejin.cn/post/7112212380397862926#comment

// NOTE: effect貌似比updated、computed要难实现一些。computed因为需要的是返回值，实际上并不需要动态依赖收集。updated则是指定了依赖。

// proxy的一大优势就是可以监听数组（https://blog.csdn.net/weixin_43574780/article/details/108042951）
// 其实array.push等，也只是一种事先封装好的方法。本质上还是对array对象进行了一系列操作才实现出了效果，而这些操作过程中本身就涉及到了对array属性的读取（get）和赋值（set）、
// 比如length、[index]等，所以才会触发get或者set监听，并把相关的拦截里的逻辑走了一遍，最后实现了一摸一样的（push等）效果
// proxy和obj始终保持状态一直，proxy进行了什么操作之后，obj同样做出改变，是一个对obj全对象的监听

// Q：Vue3使用Proxy实现数据监听的理由（列举）？