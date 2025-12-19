import { useEffect, useState } from "react";
import { fetchAnnualReportData } from "../utils/user/fetchAnnualReport";


export const AnnualReportPage = ({ username, year }: { username: string, year: string }) => {
  const [dataPromise] = useState(async () => {
    return await fetchAnnualReportData(username, year);
  });
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAnnualReportData>> | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (!dataPromise) return;
      setIsFetching(true);
      try {
        const data = await dataPromise;
        setData(data);
        console.log('Fetched all events:', data); // 在控制台输出解析结果
      } catch (error) {
        console.error('Error fetching all user events:', error);
      } finally {
        setIsFetching(false);
      }
    };
    getData();
  }, [dataPromise]);

  return <p>{username}的{year}年度报告</p>
}