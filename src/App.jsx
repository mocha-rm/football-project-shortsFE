import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [shorts, setShorts] = useState([]); // 전체 숏츠 리스트
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 보고 있는 숏츠 인덱스
  const [page, setPage] = useState(0); // 현재 페이지 번호
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
  const [isFetching, setIsFetching] = useState(false); // 중복 요청 방지

  // API 요청 (숏츠 데이터 가져오기)
  const fetchShorts = async () => {
    if (isFetching || !hasMore) return; // 중복 요청 방지
    setIsFetching(true);

    try {
      const res = await axios.get('http://localhost:8080/shorts/feed', {
        params: { page, size: 10 }, // 10개씩 불러오기
      });

      console.log('숏츠 데이터:', res.data); // 응답 데이터 출력

      if (res.data.content.length > 0) {
        // `Page` 객체를 사용하는 경우 `content` 접근!
        setShorts((prevShorts) => [...prevShorts, ...res.data.content]);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('API 요청 실패:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, [page]);

  // 마지막 동영상 감지 후 추가 로드
  const observer = useRef(null);
  const lastVideoRef = useCallback(
    (node) => {
      if (isFetching || !hasMore) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 1.0 }
      );

      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore]
  );

  // 이전 숏츠 보기
  const goToPreviousShort = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  // 다음 숏츠 보기
  const goToNextShort = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <div className="app-container">
      <h1>Shorts 테스트</h1>

      {/* 숏츠 리스트 (항상 1개만 보이도록) */}
      {shorts.length > 0 ? (
        <div className="shorts-container">
          <h3>{shorts[currentIndex].title}</h3>
          <p>{shorts[currentIndex].description}</p>
          <video
            src={shorts[currentIndex].url}
            controls
            autoPlay
            width="400" // 크기 변경
            ref={currentIndex === shorts.length - 1 ? lastVideoRef : null}
          ></video>
        </div>
      ) : (
        <p>불러올 숏츠가 없습니다.</p>
      )}

      {/* 이전/다음 버튼 */}
      <div className="button-container">
        <button onClick={goToPreviousShort} disabled={currentIndex === 0}>
          이전
        </button>
        <button
          onClick={goToNextShort}
          disabled={currentIndex === shorts.length - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
}
