import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            404 - ページが見つかりません
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
