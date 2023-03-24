# Rajahn! 💪🦁️

一个更友好、方便、强大的小程序响应式系统

#### ✨ 特点
- 使用简单，无需安装下载其它依赖，复制代码使用即可
- 上手简单，仅有一个方法，对其定义data即可

#### 🔨 能力
- 类Vue的数据变更风格
- 支持复杂的数据路径
- 支持数组操作
- 计算属性computed
- 变更监听updated

#### ✒️ 用法

##### 基本用法
```javascript
import createReactive from 'rajahn'

Page({
    onLoad() {
        createReactive({
            data: {
                a: 1,
                b: 2
            }
        })
    },
    updateData() {
        this.reactive.a = 3
        this.reactive.b = 4
    }
})

```

##### 复杂的数据路径

```javascript
import createReactive from 'rajahn'

Page({
    onLoad() {
        createReactive({
            data: {
                a: {
                    b: {
                        c: {
                            d: {
                                e: {
                                    f: ['g']
                                }
                            }
                        }
                    }
                }
            }
        })
    },
    updateData() {
        this.reactive.a.b.c.d.e.f[0] = 'h'
    }
})

```

##### 数组操作

```javascript
import createReactive from 'rajahn'

Page({
    onLoad() {
        createReactive({
            data: {
                a: [0]
            }
        })
    },
    updateData() {
        this.reactive.a[0] = 1
        this.reactive.a.push(2)
        this.reactive.a.unshift(3)
        this.reactive.a.pop()
        this.reactive.a.shift()
        this.reactive.a.splice()
    }
})

```

##### computed、updated
```javascript
import createReactive from 'rajahn'

Page({
    onLoad() {
        createReactive({
            data: {
                a: 1,
                b: 2
            },
            computed: {
                total(reactive) {
                    return reactive.a + reactive.b
                }
            },
            updated: {
                a(newVal, oldVal) {
                    console.log(newVal, oldVal)
                }
            }
        })
    },
    updateData() {
        this.reactive.a = 3
        this.reactive.b = 4
    }
})

```