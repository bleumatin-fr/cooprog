import { Project } from "@cooprog/core";
import { Feature, GeoJsonProperties, Point } from "geojson";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { favoriteProject } from "./useProject";
import { getProjects } from "./useProjects";

const useInfiniteProjects = (filter?: any) => {
  const queryClient = useQueryClient();
  const ongoingMutations = useRef(0);

  const [data, setData] = useState<{
    projects: Project[];
    markers: Feature<Point, GeoJsonProperties>[];
    totalCount: number;
    superTotalCount: number;
  }>({
    projects: [],
    markers: [],
    totalCount: 0,
    superTotalCount: 0,
  });

  const projectsInfiniteQuery = useInfiniteQuery(
    ["projects-paged", JSON.stringify(filter)],
    async ({ pageParam = 0 }) => {
      const { data, totalCount, superTotalCount } = await getProjects({
        ...filter,
        offset: pageParam * filter.limit,
      });
      return {
        projects: data.projects,
        markers: data.markers,
        totalCount: totalCount,
        superTotalCount: superTotalCount,
      };
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

  const favoriteProjectMutation = useMutation(
    (id: string) => favoriteProject(id),
    {
      onSuccess: ({ _id }) => {
        queryClient.invalidateQueries("projects-paged");
        queryClient.invalidateQueries("projects");
        queryClient.invalidateQueries(["project", _id]);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(
            ["project", updatedProject?._id],
            updatedProject
          );
      },
    }
  );

  useEffect(() => {
    if (projectsInfiniteQuery.data) {
      setData({
        projects: projectsInfiniteQuery.data?.pages.flatMap(
          (item) => item.projects
        ),
        markers: projectsInfiniteQuery.data?.pages.flatMap(
          (item) => item.markers
        ),
        totalCount: projectsInfiniteQuery.data?.pages[0]?.totalCount ?? 0,
        superTotalCount:
          projectsInfiniteQuery.data?.pages[0]?.superTotalCount ?? 0,
      });
    }
  }, [projectsInfiniteQuery.data]);

  return {
    projects: data?.projects,
    markers: data?.markers,
    totalCount: data?.totalCount,
    superTotalCount: data?.superTotalCount,
    pages: projectsInfiniteQuery.data?.pages,
    fetchNextPage: projectsInfiniteQuery.fetchNextPage,
    fetchPreviousPage: projectsInfiniteQuery.fetchPreviousPage,
    fetching: projectsInfiniteQuery.isFetchingNextPage,
    hasNextPage: projectsInfiniteQuery.hasNextPage,
    addToFavorites: favoriteProjectMutation.mutateAsync,
    error:
      projectsInfiniteQuery.error || favoriteProjectMutation.error,
    loading:
      projectsInfiniteQuery.isLoading ||
      favoriteProjectMutation.isLoading,
  };
};

export default useInfiniteProjects;
