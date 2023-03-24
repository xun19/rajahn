function getCurrentPage() {
    const pages = getCurrentPages()
    const last = pages.length - 1
    const target = pages[last] // 当前页面实例
    return target
}

function deepClone(source) {
    if (!source && typeof source !== "object") {
    //   throw new Error("error arguments", "deepClone");
        return source
    }
    const targetObj = source.constructor === Array ? [] : {};
    Object.keys(source).forEach(keys => {
      if (source[keys] && typeof source[keys] === "object") {
        targetObj[keys] = deepClone(source[keys]);
      } else {
        targetObj[keys] = source[keys];
      }
    });
    return targetObj;
  }

class Reactive {
    data = {}
    computed = {}
    updated = {}
    target = null
    proxy = null
    currentAddEffect = null
    reactiveMap = new WeakMap()
    constructor({ data, computed, updated, target }) {
        this.data = deepClone(data) // 不用原data对象，避免侵入Reactive的逻辑
        this.computed = computed
        this.updated = updated
        this.target = target

        this.initData()
    }

    addObjToWeakMap(obj) {
        if (!this.reactiveMap.get(obj)) {
            this.reactiveMap.set(obj, new Map())
        }
    }

    addPropToMap({ obj, prop}){
        this.addObjToWeakMap(obj)
        if (!this.reactiveMap.get(obj).get(prop)) {
            this.reactiveMap.get(obj).set(prop, new Set())
        }
    }

    addEffect({ obj, prop, effect}) {
        this.addPropToMap({ obj, prop }) // TODO: 逻辑调整
        const effects = this.reactiveMap.get(obj).get(prop)
        effects.add(effect)
    }

    callEffect({obj, prop}) {
        this.addPropToMap({ obj, prop }) // TODO: 逻辑调整
        const effects = this.reactiveMap.get(obj).get(prop)
        effects.forEach((effect) => {
            if (typeof effect.fn === 'function') {
                const computedValue = effect.fn(this.proxy)
                this.target.setData({
                    [effect.name]: computedValue
                })
            }
        })
    }

    initData() {
        // init
        Object.keys(this.data).forEach((key) => {
            this.target.setData({
                [key]: deepClone(this.data[key]) // 不用原data对象，避免侵入Reactive的逻辑
            })
        })

        this.createProxy({
            ancestorNames: '',
            data: this.data
        })

        this.collectComputedDeps()
    }

    createDataPath({ancestorNames, key}) { // NOTE：数据路径
        if (ancestorNames === '') return `${key}`
        if (!isNaN(Number(key))) return `${ancestorNames}[${key}]`
        else return `${ancestorNames}.${key}`
    }

    createProxy({ancestorNames, data}) {
        const proxy = new Proxy(data, {
            get:(obj, key, receiver) => {
                // console.log('get:', obj, key) // NOTE: 在Map和Set里操作时也触发了get? （v）
                if (this.currentAddEffect) { // 只是在进行依赖收集时才触发这一步
                    this.addEffect({ // 使用Set的好处，不需要考虑是否已存在，来决定是否要添加。它会自动去重
                        obj: receiver, // NOTE: 注意，用receiver
                        prop: key,
                        effect: this.currentAddEffect
                    })
                }
                
                return obj[key]
            },
            set:(obj, key, value, receiver) => {
                const dataPath = this.createDataPath({ancestorNames, key})
                if (typeof value !== 'undefined' && key !== 'length') { // setData无法将值更新成undefined
                    this.target.setData({
                        [dataPath]: value
                    })
                }

                obj[key] = value

                // call effectFn
                this.callEffect({
                    obj: receiver, 
                    prop: key
                })

                return true
            }
        })

        if (data === this.data) this.proxy = proxy // 顶层proxy

        // 嵌套reactive
        Object.keys(data).forEach((key) => {
            if (typeof data[key] === 'object') {
                const dataPath = this.createDataPath({ancestorNames, key})
                data[key] = this.createProxy({
                    ancestorNames: dataPath, // 继续把ancestorNames字符串拼接下去
                    data: data[key]
                })
            }
        })

        return proxy
    }

    collectComputedDeps() {
        Object.keys(this.computed).forEach((name) => {
            const fn = this.computed[name]
            if (typeof fn === 'function') {
                this.currentAddEffect = {
                    name,
                    fn
                }
                const computedValue = fn(this.proxy)
                this.target.setData({
                    [name]: computedValue
                })
            }
            this.currentAddEffect = null // 每次依赖收集完毕后，将currentAddEffect重置。防止在赋值时触发get且进入addEffect收集依赖
        })
    }
}

function createReactive({
    reactiveObjName, data, computed, updated, target: _this
}){
    const target = _this || getCurrentPage()
    target.reactiveInstance = new Reactive({data, computed, updated, target})
    target[reactiveObjName || 'reactive'] = target.reactiveInstance.proxy
}

export default createReactive
