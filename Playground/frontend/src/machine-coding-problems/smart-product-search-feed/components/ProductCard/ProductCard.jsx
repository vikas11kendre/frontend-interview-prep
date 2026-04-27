import { useId } from 'react';
import styles from './ProductCard.module.css';

const ProductCard = ({ id, title, description, imageURl, price, posInSet, setSize }) => {
    const titleId = useId();
    const priceId = useId();

    return (
        <article
            id={id}
            className={styles.ProductCard}
            tabIndex={0}
            aria-labelledby={titleId}
            aria-describedby={priceId}
            aria-posinset={posInSet}
            aria-setsize={setSize}
        >
            <div className={styles.ProductCard__imageWrapper}>
                <img
                    className={styles.ProductCard__image}
                    alt={title ? `${title}` : ''}
                    src={imageURl}
                    loading="lazy"
                    decoding="async"
                />
            </div>
            <div className={styles.ProductCard__body}>
                <h2 id={titleId} className={styles.ProductCard__title}>{title}</h2>
                <p className={styles.ProductCard__description}>{description}</p>
                <p id={priceId} className={styles.ProductCard__price}>
                    <span className={styles.srOnly}>Price: </span>
                    {price}
                </p>
            </div>
        </article>
    );
};

export default ProductCard;
