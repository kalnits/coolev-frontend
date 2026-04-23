import Link from "next/link";
import { Icon } from "./ui/icons";

type SitterCardProps = {
  href?: string;
  sitter: {
    id: number;
    displayName: string;
    city: string;
    addressLabel: string;
    priceLabel: string;
    ratingLabel: string;
    reviewCountLabel: string;
    description: string;
    photoUrl: string;
    badges?: string[];
  };
};

export function SitterCard({ sitter, href }: SitterCardProps) {
  return (
    <Link className="sitter-card" href={href ?? `/sitters/${sitter.id}`}>
      <div
        aria-hidden="true"
        className="card-photo"
        style={{ backgroundImage: `url(${sitter.photoUrl})` }}
      />
      <div className="card-content">
        <div className="card-head">
          <div>
            <p className="eyebrow">{sitter.city}</p>
            <h2>{sitter.displayName}</h2>
            <p className="address-copy">
              <Icon name="map-pin" size={14} />
              {sitter.addressLabel}
            </p>
          </div>
          <strong className="price-copy">{sitter.priceLabel}</strong>
        </div>
        <div className="meta-row">
          <span>
            <Icon name="star" size={14} />
            {sitter.ratingLabel}
          </span>
          <span>{sitter.reviewCountLabel}</span>
        </div>
        <p className="card-description">{sitter.description}</p>
        {sitter.badges?.length ? (
          <div className="badge-row">
            {sitter.badges.map((badge) => (
              <span key={badge} className="badge-chip">
                <Icon name="check" size={12} />
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
