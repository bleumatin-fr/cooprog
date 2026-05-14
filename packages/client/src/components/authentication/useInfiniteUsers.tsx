import { User } from "@cooprog/core";
import { Feature, GeoJsonProperties, Point } from "geojson";
import { useEffect, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { getUsers } from "./useUsers";

const useInfiniteUsers = (filter?: any) => {
  const queryClient = useQueryClient();

  const [data, setData] = useState<{
    users: User[];
    markers: Feature<Point, GeoJsonProperties>[];
    totalCount: number;
    superTotalCount: number;
  }>({
    users: [],
    markers: [],
    totalCount: 0,
    superTotalCount: 0,
  });

  const usersInfiniteQuery = useInfiniteQuery(
    ["users-paged", JSON.stringify(filter)],
    async ({ pageParam = 0 }) => {
      const { data, totalCount, superTotalCount } = await getUsers({
        ...filter,
        offset: pageParam * filter.limit,
      });

      return {
        users: data.users,
        markers: data.markers,
        totalCount: totalCount,
        superTotalCount: superTotalCount,
      };
      // setTotalCount(totalCount);
      // setSuperTotalCount(superTotalCount);
      // setMarkers(data.markers);
      // return data.users;
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const countRecords = allPages.flat().length;
        if (countRecords >= (data?.totalCount ?? 0)) {
          return undefined;
        }
        const lastPageIndex = allPages.findIndex((page) => page === lastPage);
        if (lastPageIndex < allPages.length - 1) {
          return lastPageIndex + 1;
        }
        return allPages.length;
      },
      getPreviousPageParam: (firstPage, allPages) => {
        const countRecords = allPages.flat().length;
        if (countRecords >= (data?.totalCount ?? 0)) {
          return undefined;
        }
        const firstPageIndex = allPages.findIndex((page) => page === firstPage);
        return firstPageIndex - 1;
      },
      useErrorBoundary: false,
    }
  );

  useEffect(() => {
    if (usersInfiniteQuery.data) {
      setData({
        users: usersInfiniteQuery.data?.pages.flatMap((item) => item.users),
        markers: usersInfiniteQuery.data?.pages.flatMap((item) => item.markers),
        totalCount: usersInfiniteQuery.data?.pages[0]?.totalCount ?? 0,
        superTotalCount:
          usersInfiniteQuery.data?.pages[0]?.superTotalCount ?? 0,
      });
    }
  }, [usersInfiniteQuery.data]);

  return {
    users: data?.users,
    markers: data?.markers,
    totalCount: data?.totalCount,
    superTotalCount: data?.superTotalCount,
    pages: usersInfiniteQuery.data?.pages,
    fetchNextPage: usersInfiniteQuery.fetchNextPage,
    fetchPreviousPage: usersInfiniteQuery.fetchPreviousPage,
    fetching: usersInfiniteQuery.isFetchingNextPage,
    hasNextPage: usersInfiniteQuery.hasNextPage,
    error: usersInfiniteQuery.error,
    loading: usersInfiniteQuery.isLoading,
  };
};

export default useInfiniteUsers;
