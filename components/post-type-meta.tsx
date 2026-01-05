import ReviewMetaDisplay from './review-meta-display';
import QnaMetaDisplay from './qna-meta-display';
import TipMetaDisplay from './tip-meta-display';
import MarketplaceMetaDisplay from './marketplace-meta-display';
import BreedingMetaDisplay from './breeding-meta-display';

interface PostTypeMetaProps {
  postType: string;
  meta?: Record<string, any>;
}

export default function PostTypeMeta({ postType, meta = {} }: PostTypeMetaProps) {
  if (!meta || Object.keys(meta).length === 0) {
    return null;
  }

  switch (postType) {
    case 'REVIEW':
      return (
        <ReviewMetaDisplay
          rating={meta.rating || 0}
          serviceName={meta.serviceName}
          visitDate={meta.visitDate}
          pros={meta.pros || []}
          cons={meta.cons || []}
          wouldRecommend={meta.wouldRecommend}
        />
      );

    case 'QNA':
      return (
        <QnaMetaDisplay
          topic={meta.topic}
          difficulty={meta.difficulty}
          isAnswered={meta.isAnswered || false}
          bestAnswerId={meta.bestAnswerId}
          answerCount={meta.answerCount || 0}
          expertAnswered={meta.expertAnswered}
        />
      );

    case 'TIP':
      return (
        <TipMetaDisplay
          category={meta.category}
          readTime={meta.readTime}
          difficulty={meta.difficulty}
          tags={meta.tipTags || []}
        />
      );

    case 'MARKETPLACE':
      return (
        <MarketplaceMetaDisplay
          price={meta.price || 0}
          originalPrice={meta.originalPrice}
          currency={meta.currency}
          condition={meta.condition}
          category={meta.category}
          pickupMethod={meta.pickupMethod}
          location={meta.location}
          inStock={meta.inStock}
        />
      );

    case 'BREEDING':
      return (
        <BreedingMetaDisplay
          petBreed={meta.petBreed || ''}
          petGender={meta.petGender || 'male'}
          age={meta.age}
          isNeutered={meta.isNeutered}
          isVaccinated={meta.isVaccinated}
          healthCertified={meta.healthCertified}
          lookingFor={meta.lookingFor}
          requirements={meta.requirements || []}
          fee={meta.fee}
        />
      );

    default:
      return null;
  }
}
