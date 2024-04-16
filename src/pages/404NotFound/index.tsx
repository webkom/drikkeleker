import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NotFoundPageProps {
  // props
}

const NotFoundPage: React.FC<NotFoundPageProps> = () => {
  // prettier-ignore

  return (
    <div className={'page'}>
      <h1>404: Not Found</h1>
      <h2>You seem to have misnavigated</h2>
    </div>
  );
};

export default NotFoundPage;
