class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
     constructor() {
        this.head = null;
        this.tail = null;
        this.length=0;
    }
    remove(node){
        // case1 only head;
        if(this.length===1){
            this.head=null;
            this.tail=null;
            this.length=0;
            return
        };   
        if(!node.prev && node.prev!==0){
                node.next.prev=null;
            this.head=node.next;
        }else if(!node.next && node.next!==0){
            node.prev.next=null;
            this.tail=node.prev;
        } else{
            node.prev.next=node.next;
            node.next.prev=node.prev;
        };
        this.length--;
    }
    
    insertAtHead(node){
        if(!this.head){
            this.head=node;
            this.tail=node;
            this.length=1;
        }else{
            node.prev=null;
            node.next=this.head;
            this.head.prev=node;
            this.head=node;
            this.length++;
        }

    }
}

export default class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.list = new DoublyLinkedList();
    }

    get(key){
        if(!this.cache.has(key)) return -1;
        let node= this.cache.get(key);
        this.list.remove(node);
        this.list.insertAtHead(node);
        return node.value
    }
    put(key,value){
        if(this.cache.has(key)){
            let node = this.cache.get(key);
            node.value=value;
            this.list.remove(node);
            this.list.insertAtHead(node);
        }else{
            let node = new Node(key, value);
            if(this.cache.size>=this.capacity){
                let lru=this.list.tail;
                this.list.remove(lru)
                this.cache.delete(lru.key);
            };
            this.list.insertAtHead(node);
            this.cache.set(key, node)
        }
    }
}