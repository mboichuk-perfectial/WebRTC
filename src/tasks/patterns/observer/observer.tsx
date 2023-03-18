import './observer.css';
import {useEffect, useState} from "react";
const SubscribeButton = ({ toggleSub, isSub }: {toggleSub: () => void, isSub: boolean}) => {
    return (
        <button onClick={toggleSub}>{!isSub ? 'Subscribe' : 'Unsubscribe'}</button>
    )
}

interface NewsSection {
    newsColumn: Subscriber,
    sub: boolean,
    setSub: (toggle: boolean) => void,
    news: string,
}

const NewsSection = ({ newsColumn, news, sub, setSub }: NewsSection) => {
    return (
        <div>
            <SubscribeButton isSub={sub} toggleSub={() => {
                setSub(!sub);
                !sub
                    ? publisher.subscribe(newsColumn)
                    : publisher.unsubscribe(newsColumn)
            }} />
            <div className="news-block">
                {news}
            </div>
        </div>
    )
}

interface Subscriber {
    update: (context: string) => void,
}

class News {
    publisher: Publisher = new Publisher();
    news: string[] = [];

    constructor(publisher: Publisher) {
        this.publisher = publisher;
    }

    publishNews: (news: string) => void = (news) => {
        this.news.push(news);
        this.publisher.notifySubscribers(news);
    };
}

class Publisher {
    subscribers: Set<Subscriber> = new Set();
    subscribe: (s: Subscriber) => void = (s) => this.subscribers.add(s);
    unsubscribe: (s: Subscriber) => void = (s) => this.subscribers.delete(s);
    notifySubscribers: (data: string) => void = (data) => {
        this.subscribers.forEach((s) => s.update(data));
    }
}

let publisher: Publisher;
let newsPublisher: News;
const newsColumns: Subscriber[] = [
    { update: () => {} },
    { update: () => {} },
    { update: () => {} },
];

export const Observer = () => {
    const [news0, setNews0] = useState('');
    const [news1, setNews1] = useState('');
    const [news2, setNews2] = useState('');
    const [sub0, setSub0] = useState(false);
    const [sub1, setSub1] = useState(false);
    const [sub2, setSub2] = useState(false);
    const [newsFeed, setNewsFeed] = useState('');
    newsColumns[0].update = (n: string) => setNews0(`${news0}\n${n}`);
    newsColumns[1].update = (n: string) => setNews1(`${news1}\n${n}`);
    newsColumns[2].update = (n: string) => setNews2(`${news2}\n${n}`)

    useEffect(() => {
        publisher = new Publisher();
        newsPublisher = new News(publisher);
    }, []);

    return newsColumns?.length && (
        <div className="news">
            <NewsSection newsColumn={newsColumns[0]} sub={sub0} setSub={setSub0} news={news0} />
            <NewsSection newsColumn={newsColumns[1]} sub={sub1} setSub={setSub1} news={news1} />
            <NewsSection newsColumn={newsColumns[2]} sub={sub2} setSub={setSub2} news={news2} />
            <div className="news-input">
                <textarea rows={15} onChange={(e) => setNewsFeed(e.target.value)} value={newsFeed} />
                <button onClick={() => newsPublisher.publishNews(newsFeed)}>Publish</button>
            </div>
        </div>
    );
};